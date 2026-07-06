import path from "path";
import { defineConfig } from "@playwright/test";

const slowMo = Number(process.env.PW_SLOW_MO ?? 0);
const authStatePath = process.env.PW_AUTH_STATE_PATH || undefined;
const dataDir = process.env.DATA_DIR || process.cwd();

export default defineConfig({
  testDir: path.join(dataDir, "generated"),
  testMatch: "**/*.ts",
  // No test-level timeout ceiling: tests wait as long as the app actually
  // takes to respond. Use the Stop button in the terminal to abort manually.
  timeout: 0,
  use: {
    launchOptions: {
      slowMo,
    },
    storageState: authStatePath,
  },
});
