import { test, expect } from '@playwright/test';


test.use({
  storageState: "/Users/pavantejagurajapu/Downloads/playwright/automatest/server/.auth/storage-state.json"
});
test('test', async ({ page }) => {
  await page.goto('https://beta.openplanai.com/login');
});