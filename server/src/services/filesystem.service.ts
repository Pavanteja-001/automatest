import fs from "fs";
import path from "path";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
}

export class FilesystemService {
  private rootPath = path.join(process.cwd(), "generated");

  private resolveSafe(relativePath: string): string {
    const target = path.normalize(path.join(this.rootPath, relativePath));
    const root = path.normalize(this.rootPath);

    if (target !== root && !target.startsWith(root + path.sep)) {
      throw new Error("Invalid path");
    }

    return target;
  }

  getTree(): FileNode[] {
    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath, { recursive: true });
    }

    return this.readDir(this.rootPath, "")
      .filter((node) => node.path !== "current.spec.ts");
  }

  private readDir(dirPath: string, relativePath: string): FileNode[] {
    return fs
      .readdirSync(dirPath, { withFileTypes: true })
      .map((entry) => {
        const entryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          return {
            name: entry.name,
            path: entryPath,
            type: "folder" as const,
            children: this.readDir(path.join(dirPath, entry.name), entryPath),
          };
        }

        return {
          name: entry.name,
          path: entryPath,
          type: "file" as const,
        };
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "folder" ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
      });
  }

  createFolder(relativePath: string) {
    const target = this.resolveSafe(relativePath);

    fs.mkdirSync(target, { recursive: true });
  }

  createFile(relativePath: string) {
    const target = this.resolveSafe(relativePath);

    if (fs.existsSync(target)) {
      throw new Error("File already exists");
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, "");
  }

  readFile(relativePath: string): string {
    const target = this.resolveSafe(relativePath);

    if (!fs.existsSync(target)) {
      throw new Error("File not found");
    }

    return fs.readFileSync(target, "utf8");
  }

  writeFile(relativePath: string, content: string) {
    const target = this.resolveSafe(relativePath);

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
  }
}
