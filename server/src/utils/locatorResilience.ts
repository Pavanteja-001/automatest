import fs from "fs";
import path from "path";

interface RuleResult {
  code: string;
  warnings: string[];
}

const GET_BY_ROLE_RE = /([\w.]+)\.getByRole\(\s*(['"])([^'"]+)\2\s*,\s*\{([^}]*)\}\s*\)/g;

function widenNameDescriptionDuality(code: string): RuleResult {
  const warnings: string[] = [];

  const nextCode = code.replace(GET_BY_ROLE_RE, (match, receiver, quote, role, props) => {
    if (/\bname\s*:/.test(props)) {
      return match;
    }

    const descMatch = props.match(/description\s*:\s*(['"])((?:[^\\]|\\.)*?)\1/);

    if (!descMatch) {
      return match;
    }

    const [, descQuote, text] = descMatch;
    const exactMatch = props.match(/exact\s*:\s*(true|false)/);
    const exact = exactMatch ? exactMatch[1] : "true";

    const nameOpts = `{ name: ${descQuote}${text}${descQuote}, exact: ${exact} }`;
    const descOpts = `{ description: ${descQuote}${text}${descQuote}, exact: ${exact} }`;

    return (
      `${receiver}.getByRole(${quote}${role}${quote}, ${nameOpts})` +
      `.or(${receiver}.getByRole(${quote}${role}${quote}, ${descOpts}))` +
      `.first()`
    );
  });

  return { code: nextCode, warnings };
}

function warnPositionalLocators(code: string): RuleResult {
  const warnings: string[] = [];
  const lines = code.split("\n");

  lines.forEach((line, idx) => {
    if (/\.(nth|first|last)\(/.test(line)) {
      warnings.push(
        `Line ${idx + 1} uses a position-based locator (${line.trim()}) — this breaks if item order changes. Consider a more specific role/text locator.`
      );
    }
  });

  return { code, warnings };
}

function warnPossibleHoverOnlyTooltip(code: string): RuleResult {
  const warnings: string[] = [];
  const lines = code.split("\n");
  const roleLocatorRe = /\.getByRole\(\s*(['"])([^'"]+)\1\s*,\s*\{([^}]*)\}\s*\)/;

  lines.forEach((line, idx) => {
    const match = line.match(roleLocatorRe);

    if (!match) {
      return;
    }

    const [, , role, props] = match;

    if (/\bname\s*:/.test(props)) {
      return;
    }

    const descMatch = props.match(/description\s*:\s*(['"])((?:[^\\]|\\.)*?)\1/);

    if (!descMatch) {
      return;
    }

    warnings.push(
      `Line ${idx + 1} locator relies solely on description: '${descMatch[2]}' for role '${role}' — if this text only appears in a hover-triggered tooltip, it may never resolve during automated replay (the tooltip mounts as a side effect of hovering, which happens only once the click begins, not before). Consider a stable attribute-based locator instead, e.g. page.locator('a[href="..."]') or a data-testid.`
    );
  });

  return { code, warnings };
}

function warnStructuralLocators(code: string): RuleResult {
  const warnings: string[] = [];
  const lines = code.split("\n");
  const structuralLocatorRe = /\.locator\(\s*(['"])((?:[^\\]|\\.)*?)\1/g;

  lines.forEach((line, idx) => {
    let match: RegExpExecArray | null;
    structuralLocatorRe.lastIndex = 0;

    while ((match = structuralLocatorRe.exec(line))) {
      const selector = match[2];

      if (/[>~]|:nth-child|:nth-of-type/.test(selector)) {
        warnings.push(
          `Line ${idx + 1} uses a structural CSS selector tied to current markup (${selector}) — consider adding a data-testid to this element.`
        );
      }
    }
  });

  return { code, warnings };
}

function handleManualFileUploads(code: string): RuleResult {
  const warnings: string[] = [];

  // Matches page.locator('...').setInputFiles('filename')
  const setInputFilesRe = /(?:await\s+)?(page(?:\.locator\([^)]+\))+(?:\.[a-zA-Z0-9_]+(?:\([^)]*\))?)*)\.setInputFiles\(\s*(['"])([^'"]+)\2\s*\);?/g;

  let fileMissing = false;
  let nextCode = code;

  const nextCodeResult = code.replace(setInputFilesRe, (match, locator, quote, filename) => {
    const serverPath = path.join(process.cwd(), filename);
    const generatedPath = path.join(process.cwd(), "generated", filename);

    if (fs.existsSync(serverPath) || fs.existsSync(generatedPath)) {
      return match;
    }

    fileMissing = true;
    warnings.push(
      `File '${filename}' was not found in the workspace. Added a runtime check that waits for manual upload if still missing.`
    );

    return (
      `if (fs.existsSync(${quote}${filename}${quote})) {\n` +
      `    await ${locator}.setInputFiles(${quote}${filename}${quote});\n` +
      `  } else {\n` +
      `    // File '${filename}' was not found in the workspace. Waiting for manual upload...\n` +
      `    await page.waitForFunction(() => {\n` +
      `      const inputs = Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];\n` +
      `      return inputs.some(input => input.files && input.files.length > 0);\n` +
      `    }, undefined, { timeout: 0 });\n` +
      `  }`
    );
  });

  if (fileMissing) {
    nextCode = nextCodeResult;
    if (!nextCode.includes("import fs from 'fs'") && !nextCode.includes('import fs from "fs"')) {
      nextCode = nextCode.replace(
        /(import\s*\{[^}]*\}\s*from\s*['"]@playwright\/test['"];?\s*)/,
        `$1\nimport fs from 'fs';\n`
      );
    }
  }

  return { code: nextCode, warnings };
}

const AUTO_FIX_RULES: Array<(code: string) => RuleResult> = [
  widenNameDescriptionDuality,
  handleManualFileUploads,
];

// Warn rules run against the pre-fix code so they flag what codegen itself
// produced, not `.first()`/etc. safety nets that the auto-fix rules add.
const WARN_RULES: Array<(code: string) => RuleResult> = [
  warnPositionalLocators,
  warnPossibleHoverOnlyTooltip,
  warnStructuralLocators,
];

export function applyLocatorResilience(code: string): RuleResult {
  const warnings: string[] = [];

  for (const rule of WARN_RULES) {
    warnings.push(...rule(code).warnings);
  }

  let currentCode = code;

  for (const rule of AUTO_FIX_RULES) {
    const ruleResult = rule(currentCode);
    currentCode = ruleResult.code;
    warnings.push(...ruleResult.warnings);
  }

  return { code: currentCode, warnings };
}
