import { spawn, exec } from "child_process";
import fs from "fs";
import path from "path";
import { getIO } from "../socket/socket";
import { ChildProcessWithoutNullStreams } from "child_process";
import { AuthService } from "./auth.service";

export class PlaywrightService {
  private outputPath = path.join(
    process.cwd(),
    "generated",
    "current.spec.ts"
  );

  private runningTest: ChildProcessWithoutNullStreams | null = null;
  private isStarting = false;
  private authService = new AuthService();

  isRunning(): boolean {
    return Boolean(this.runningTest) || this.isStarting;
  }

  async startRecording(autoLogin?: boolean) {
    if (!fs.existsSync(path.dirname(this.outputPath))) {
      fs.mkdirSync(path.dirname(this.outputPath), { recursive: true });
    }

    // Delete old recording
    if (fs.existsSync(this.outputPath)) {
      fs.unlinkSync(this.outputPath);
    }

    const args = ["playwright", "codegen", "--output", this.outputPath];

    if (autoLogin) {
      getIO().emit("terminal", "\x1b[35m\nAuto Login: signing in before opening the recorder...\x1b[0m\n");

      try {
        const authStatePath = await this.authService.login();
        args.push("--load-storage", authStatePath);
        getIO().emit(
          "terminal",
          "\x1b[35mAuto Login: session ready — pasting the app URL will land you already signed in.\x1b[0m\n"
        );
      } catch (err) {
        getIO().emit("terminal", `\x1b[31m\nAuto Login failed: ${(err as Error).message}\x1b[0m\n`);
        getIO().emit("terminal", "\x1b[33mOpening the recorder without auto login.\x1b[0m\n");
      }
    }

    const baseUrl = this.authService.getBaseUrl();

    if (baseUrl) {
      args.push(baseUrl);
      getIO().emit("terminal", `\x1b[36m\nOpening recorder at ${baseUrl}...\x1b[0m\n`);
    }

    const process = spawn(
      "npx",
      args,
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

async runTest(name?: string, slowMo?: number, headed?: boolean, autoLogin?: boolean) {

    if (this.runningTest || this.isStarting) {

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

    this.isStarting = true;

    let authStatePath: string | undefined;

    if (autoLogin) {

        getIO().emit("terminal", "\x1b[35m\nAuto Login: authenticating...\x1b[0m\n");

        try {
            authStatePath = await this.authService.login();
            getIO().emit("terminal", "\x1b[35mAuto Login: token acquired, injecting into the browser session.\x1b[0m\n");
        } catch (err) {
            getIO().emit("terminal", `\x1b[31m\nAuto Login failed: ${(err as Error).message}\x1b[0m\n`);
            this.isStarting = false;
            return;
        }
    }

    const slowMoMs = slowMo && slowMo > 0 ? slowMo : 0;

    const args = ["playwright", "test", filePath];

    if (headed) {
        args.push("--headed");
    }

    this.runningTest = spawn(
        "npx",
        args,
        {
            shell: true,
            stdio: "pipe",
            env: {
                ...process.env,
                PW_SLOW_MO: String(slowMoMs),
                FORCE_COLOR: "1",
                ...(authStatePath ? { PW_AUTH_STATE_PATH: authStatePath } : {})
            }
        }
    );

    this.isStarting = false;

    getIO().emit(
        "terminal",
        headed
            ? "\x1b[36m\nRunning in headed mode — a browser window will open.\x1b[0m\n"
            : "\x1b[90m\nRunning headless in the background.\x1b[0m\n"
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

stopTest() {

    if (!this.runningTest || !this.runningTest.pid) {

        getIO().emit("terminal", "\x1b[33m\nNo test is currently running.\x1b[0m\n");

        return;
    }

    const pid = this.runningTest.pid;

    getIO().emit("terminal", "\x1b[33m\nStopping test...\x1b[0m\n");

    if (process.platform === "win32") {
        // spawn used shell:true, so the tree (npx -> node -> browser) must be killed, not just the shell.
        exec(`taskkill /PID ${pid} /T /F`);
    } else {
        try {
            process.kill(-pid, "SIGTERM");
        } catch {
            this.runningTest.kill("SIGTERM");
        }
    }

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