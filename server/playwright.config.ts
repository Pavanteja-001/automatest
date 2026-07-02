import { defineConfig } from "@playwright/test";

const slowMo = Number(process.env.PW_SLOW_MO ?? 0);

export default defineConfig({
  testDir: "generated",
  testMatch: "**/*.ts",
  use: {
    launchOptions: {
      slowMo,
    },
  },
});
