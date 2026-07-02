import { test, expect } from '@playwright/test';


test.use({
  storageState: 'C:\\Users\\Naveen\\Desktop\\playwright\\server\\.auth\\storage-state.json'
});

test('test', async ({ page }) => {
  await page.goto('https://beta.openplanai.com/');
  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('link', { name: 'Reports' }).click();
  await page.getByText('At Risk').click();
  await page.getByRole('tab', { name: 'Issues' }).click();
  await page.getByRole('button', { name: '+ Add Issue' }).first().click();
  await page.getByRole('textbox', { name: 'Issue title...' }).click();
  await page.getByRole('textbox', { name: 'Issue title...' }).fill('hahahhahaha');
  await page.getByRole('textbox', { name: 'Describe the issue in detail' }).click();
  await page.getByRole('textbox', { name: 'Describe the issue in detail' }).fill('make it new ');
  await page.getByRole('button', { name: 'Create Issue' }).click();
});

