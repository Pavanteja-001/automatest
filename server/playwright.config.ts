import { defineConfig } from "@playwright/test";

const slowMo = Number(process.env.PW_SLOW_MO ?? 0);
const authStatePath = process.env.PW_AUTH_STATE_PATH || undefined;

export default defineConfig({
  testDir: "generated",
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
