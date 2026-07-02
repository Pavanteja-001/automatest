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

runTest(name?: string, slowMo?: number) {

    if (this.runningTest) {

        getIO().emit("terminal", "\nA test is already running.\n");

        return;
    }

    const fileName = name ? path.basename(name) : "current.spec.ts";
    const filePath = path.posix.join("generated", fileName);

    if (!fs.existsSync(path.join(path.dirname(this.outputPath), fileName))) {

        getIO().emit("terminal", `\nTest file not found: ${fileName}\n`);

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
                PW_SLOW_MO: String(slowMoMs)
            }
        }
    );

    if (slowMoMs > 0) {
        getIO().emit("terminal", `\nSlow motion enabled (${slowMoMs}ms per step).\n`);
    }

    getIO().emit("test-started", { name: fileName });

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
            name: fileName
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