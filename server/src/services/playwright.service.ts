import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { getIO } from "../socket/socket";
import { ChildProcessWithoutNullStreams } from "child_process";

export class PlaywrightService {
  private outputPath = path.join(
    process.cwd(),
    "generated",
    "current.spec.ts"
  );

  private runningTest: ChildProcessWithoutNullStreams | null = null;

  startRecording() {
    if (!fs.existsSync(path.dirname(this.outputPath))) {
      fs.mkdirSync(path.dirname(this.outputPath), { recursive: true });
    }

    // Delete old recording
    if (fs.existsSync(this.outputPath)) {
      fs.unlinkSync(this.outputPath);
    }

    const process = spawn(
      "npx",
      [
        "playwright",
        "codegen",
        "--output",
        this.outputPath
      ],
      {
        shell: true,
        stdio: "pipe"
      }
    );

    process.stdout.on("data", (data) => {
      getIO().emit("terminal", data.toString());
    });

    process.stderr.on("data", (data) => {
      getIO().emit("terminal", data.toString());
    });

    process.on("close", () => {
      let code = "";

      if (fs.existsSync(this.outputPath)) {
        code = fs.readFileSync(this.outputPath, "utf8");
      }

      getIO().emit("recording-complete", {
        code
      });
    });

    return true;
  }

  getGeneratedCode() {
    if (!fs.existsSync(this.outputPath)) {
      return "";
    }

    return fs.readFileSync(this.outputPath, "utf8");
  }

private resolveTestPath(relativePath: string): { absolutePath: string; posixPath: string } {
    const generatedRoot = path.dirname(this.outputPath);
    const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
    const absolutePath = path.normalize(path.join(generatedRoot, normalized));

    if (absolutePath !== generatedRoot && !absolutePath.startsWith(generatedRoot + path.sep)) {
        throw new Error("Invalid path");
    }

    return {
        absolutePath,
        posixPath: path.posix.join("generated", normalized),
    };
}

runTest(name?: string, slowMo?: number) {

    if (this.runningTest) {

        getIO().emit("terminal", "\x1b[33m\nA test is already running.\x1b[0m\n");

        return;
    }

    const relativePath = name ? name : "current.spec.ts";

    let absolutePath: string;
    let filePath: string;

    try {
        ({ absolutePath, posixPath: filePath } = this.resolveTestPath(relativePath));
    } catch {
        getIO().emit("terminal", `\x1b[31m\nInvalid test path: ${relativePath}\x1b[0m\n`);
        return;
    }

    if (!fs.existsSync(absolutePath)) {

        getIO().emit("terminal", `\x1b[31m\nTest file not found: ${relativePath}\x1b[0m\n`);

        return;
    }

    const slowMoMs = slowMo && slowMo > 0 ? slowMo : 0;

    this.runningTest = spawn(
        "npx",
        [
            "playwright",
            "test",
            filePath,
            "--headed"
        ],
        {
            shell: true,
            stdio: "pipe",
            env: {
                ...process.env,
                PW_SLOW_MO: String(slowMoMs),
                FORCE_COLOR: "1"
            }
        }
    );

    if (slowMoMs > 0) {
        getIO().emit("terminal", `\x1b[36m\nSlow motion enabled (${slowMoMs}ms per step).\x1b[0m\n`);
    }

    getIO().emit("test-started", { name: relativePath });

    this.runningTest.stdout.on("data", (data) => {

        getIO().emit(
            "terminal",
            data.toString()
        );

    });

    this.runningTest.stderr.on("data", (data) => {

        getIO().emit(
            "terminal",
            data.toString()
        );

    });

    this.runningTest.on("close", (code) => {

        getIO().emit("test-complete", {
            exitCode: code,
            name: relativePath
        });

        this.runningTest = null;

    });

}

saveTest(name: string, code: string) {

    const safeName = path.basename(name).replace(/\.spec\.ts$/, "");

    const file = path.join(
        path.dirname(this.outputPath),
        `${safeName}.spec.ts`
    );

    fs.writeFileSync(file, code);

}

getAllTests() {

    const folder = path.dirname(
        this.outputPath
    );

    return fs.readdirSync(folder)
        .filter(file => file.endsWith(".spec.ts"))
        .filter(file => file !== "current.spec.ts");

}

loadTest(name: string) {

    const file = path.join(
        path.dirname(this.outputPath),
        path.basename(name)
    );

    if (!fs.existsSync(file)) {
        throw new Error("Test not found");
    }

    return fs.readFileSync(
        file,
        "utf8"
    );

}
}