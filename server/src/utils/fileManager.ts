import fs from "fs";
import path from "path";

const GENERATED_FOLDER = path.join(
  process.cwd(),
  "generated"
);

export function ensureGeneratedFolder() {
  if (!fs.existsSync(GENERATED_FOLDER)) {
    fs.mkdirSync(GENERATED_FOLDER, {
      recursive: true,
    });
  }
}

export function getGeneratedFolder() {
  ensureGeneratedFolder();
  return GENERATED_FOLDER;
}