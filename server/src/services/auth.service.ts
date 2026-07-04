import fs from "fs";
import path from "path";

interface LoginConfig {
  loginUrl?: string;
  email?: string;
  password?: string;
  baseUrl?: string;
}

interface StorageStateCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

interface StorageState {
  cookies: StorageStateCookie[];
  origins: {
    origin: string;
    localStorage?: { name: string; value: string }[];
  }[];
}

const TOKEN_PATH_CANDIDATES = [
  "token",
  "accessToken",
  "access_token",
  "authToken",
  "jwt",
  "data.token",
  "data.accessToken",
  "data.access_token",
];

export class AuthService {
  private configPath = path.join(process.cwd(), "generated", "login.config.json");
  private stateDir = path.join(process.cwd(), ".auth");
  private stateFile = path.join(this.stateDir, "storage-state.json");

  ensureConfigTemplate() {
    if (fs.existsSync(this.configPath)) return;

    const template = {
      _instructions:
        "Fill in your application's login API details, then turn on 'Auto Login' in the toolbar to authenticate automatically before every test run. " +
        "baseUrl is optional — if set, clicking Record opens the recorder directly at that page instead of a blank browser.",
      loginUrl: "https://your-api.com/auth/login",
      email: "",
      password: "",
      baseUrl: "",
    };

    fs.mkdirSync(path.dirname(this.configPath), { recursive: true });
    fs.writeFileSync(this.configPath, JSON.stringify(template, null, 2));
  }

  getStorageStatePath(): string {
    return this.stateFile;
  }

  getBaseUrl(): string | undefined {
    if (!fs.existsSync(this.configPath)) return undefined;

    try {
      const config: LoginConfig = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
      const baseUrl = config.baseUrl?.trim();

      return baseUrl ? baseUrl : undefined;
    } catch {
      return undefined;
    }
  }

  private readConfig(): LoginConfig {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(
        "login.config.json not found. Open it in the file explorer and fill in your login details."
      );
    }

    try {
      return JSON.parse(fs.readFileSync(this.configPath, "utf8"));
    } catch {
      throw new Error("login.config.json is not valid JSON.");
    }
  }

  private readAtPath(body: unknown, dottedPath: string): unknown {
    let value: unknown = body;

    for (const segment of dottedPath.split(".").filter(Boolean)) {
      if (value === null || typeof value !== "object") return undefined;

      value = (value as Record<string, unknown>)[segment];
    }

    return value;
  }

  private extractBodyToken(body: unknown): string | undefined {
    for (const candidate of TOKEN_PATH_CANDIDATES) {
      const value = this.readAtPath(body, candidate);

      if (typeof value === "string" && value) {
        return value;
      }
    }

    return undefined;
  }

  private parseSetCookie(raw: string, requestUrl: string): StorageStateCookie {
    const parts = raw.split(";").map((p) => p.trim());
    const [nameValue, ...attrs] = parts;
    const eqIdx = nameValue.indexOf("=");
    const name = nameValue.slice(0, eqIdx);
    const value = nameValue.slice(eqIdx + 1);

    let domain = new URL(requestUrl).hostname;
    let cookiePath = "/";
    let expires = -1;
    let httpOnly = false;
    let secure = false;
    let sameSite: StorageStateCookie["sameSite"] = "Lax";

    for (const attr of attrs) {
      const eq = attr.indexOf("=");
      const key = (eq === -1 ? attr : attr.slice(0, eq)).toLowerCase();
      const val = eq === -1 ? "" : attr.slice(eq + 1);

      if (key === "domain" && val) domain = val.replace(/^\./, "");
      else if (key === "path" && val) cookiePath = val;
      else if (key === "expires" && val) expires = Math.floor(new Date(val).getTime() / 1000);
      else if (key === "max-age" && val) expires = Math.floor(Date.now() / 1000) + Number(val);
      else if (key === "httponly") httpOnly = true;
      else if (key === "secure") secure = true;
      else if (key === "samesite" && val) {
        const v = val.toLowerCase();
        sameSite = v === "strict" ? "Strict" : v === "none" ? "None" : "Lax";
      }
    }

    return { name, value, domain, path: cookiePath, expires, httpOnly, secure, sameSite };
  }

  private writeStorageState(cookies: StorageStateCookie[], bodyToken: string | undefined, loginUrl: string): string {
    const state: StorageState = { cookies, origins: [] };

    if (bodyToken) {
      state.origins.push({
        origin: new URL(loginUrl).origin,
        localStorage: [{ name: "authToken", value: bodyToken }],
      });
    }

    fs.mkdirSync(this.stateDir, { recursive: true });
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));

    return this.stateFile;
  }

  async login(): Promise<string> {
    const config = this.readConfig();

    if (!config.loginUrl || !config.email || !config.password) {
      throw new Error("loginUrl, email, and password must all be set in login.config.json.");
    }

    let response: Response;

    try {
      response = await fetch(config.loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: config.email, password: config.password }),
      });
    } catch (err) {
      throw new Error(`Could not reach login API: ${(err as Error).message}`);
    }

    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        throw new Error(
          `Login API returned status ${response.status}. This usually means loginUrl is the ` +
          `browser page you log in on, not the actual API endpoint the login form submits to. ` +
          `Open DevTools -> Network in your browser, log in manually, and use the URL of the ` +
          `POST request you see there instead.`
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Login API returned status ${response.status}. Double-check the email and password ` +
          `in login.config.json.`
        );
      }

      throw new Error(`Login API returned status ${response.status}.`);
    }

    const setCookieHeaders = response.headers.getSetCookie
      ? response.headers.getSetCookie()
      : [];
    const cookies = setCookieHeaders.map((raw) => this.parseSetCookie(raw, config.loginUrl!));

    let bodyToken: string | undefined;

    try {
      const body = await response.json();
      bodyToken = this.extractBodyToken(body);
    } catch {
      // Non-JSON response body — fine as long as auth came through as cookies.
    }

    if (cookies.length === 0 && !bodyToken) {
      throw new Error(
        "Login succeeded but no session cookie or token was found in the response. " +
        "Could not determine how this app tracks the logged-in session."
      );
    }

    return this.writeStorageState(cookies, bodyToken, config.loginUrl);
  }
}
