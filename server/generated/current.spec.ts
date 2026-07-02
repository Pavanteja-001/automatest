import { test, expect } from '@playwright/test';

test.use({
  storageState: 'C:\\Users\\Naveen\\Desktop\\playwright\\server\\.auth\\storage-state.json'
});

test('test', async ({ page }) => {
  await page.goto('https://beta.openplanai.com/');
  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('link', { name: 'My Day' }).click();
  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('heading', { name: 'Dependency' }).click();
  await page.getByRole('heading', { name: 'To Do' }).click();
  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('link', { name: 'Team' }).click();
  await page.getByRole('link', { name: 'Integrations' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'R', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await page.getByRole('tab', { name: 'General' }).click();
  await page.getByRole('tab', { name: 'Profile' }).click();
  await page.getByRole('tab', { name: 'Notifications Soon' }).click();
  await page.getByRole('tab', { name: 'Appearance' }).click();
  await page.getByRole('button', { name: 'Dark' }).click();
  await page.getByRole('button', { name: 'Save Appearance' }).click();
  await page.getByRole('button', { name: 'System' }).click();
  await page.getByRole('button', { name: 'Save Appearance' }).click();
});