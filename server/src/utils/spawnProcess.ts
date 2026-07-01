import { spawn, ChildProcessWithoutNullStreams } from "child_process";

export function spawnProcess(
    command: string,
    args: string[]
): ChildProcessWithoutNullStreams {

    return spawn(command, args, {
        shell: true,
        stdio: "pipe"
    });

}