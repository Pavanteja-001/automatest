import fs from "fs";
import path from "path";

interface LoginConfig {
  loginUrl?: string;
  email?: string;
  password?: string;
}

interface StorageState {
  cookies: Record<string, unknown>[];
  origins: {
    origin: string;
    localStorage?: { name: string; value: string }[];
  }[];
}

const DEFAULT_STORAGE_KEY = "authToken";

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
        "Fill in your application's login API details, then turn on 'Auto Login' in the toolbar to authenticate automatically before every test run.",
      loginUrl: "https://your-api.com/auth/login",
      email: "",
      password: "",
    };

    fs.mkdirSync(path.dirname(this.configPath), { recursive: true });
    fs.writeFileSync(this.configPath, JSON.stringify(template, null, 2));
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

  private extractToken(body: unknown): string {
    for (const candidate of TOKEN_PATH_CANDIDATES) {
      const value = this.readAtPath(body, candidate);

      if (typeof value === "string" && value) {
        return value;
      }
    }

    throw new Error(
      "Could not find a token in the login response. Looked for: " +
        TOKEN_PATH_CANDIDATES.join(", ")
    );
  }

  private writeStorageState(token: string, loginUrl: string): string {
    const origin = new URL(loginUrl).origin;

    const state: StorageState = {
      cookies: [],
      origins: [
        {
          origin,
          localStorage: [{ name: DEFAULT_STORAGE_KEY, value: token }],
        },
      ],
    };

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

    const body = await response.json();
    const token = this.extractToken(body);

    return this.writeStorageState(token, config.loginUrl);
  }
}
