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

runTest() {

    if (this.runningTest) {

        getIO().emit("terminal", "\nA test is already running.\n");

        return;
    }

    this.runningTest = spawn(
        "npx",
        [
            "playwright",
    "test",
    "generated/current.spec.ts --headed"
        ],
        {
            shell: true,
            stdio: "pipe"
        }
    );

    getIO().emit("test-started");

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
            exitCode: code
        });

        this.runningTest = null;

    });

}

saveTest(name: string, code: string) {

    const file = path.join(
        this.outputPath.replace(
            "current.spec.ts",
            `${name}.spec.ts`
        )
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
        name
    );

    return fs.readFileSync(
        file,
        "utf8"
    );

}
}