import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://beta.openplanai.com/');
  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('link', { name: 'Reports' }).click();
  await page.getByRole('button', { name: '7 days' }).click();
  await page.getByRole('button', { name: 'Custom' }).click();
  await page.getByRole('button', { name: 'Select dates' }).click();
  await page.getByRole('gridcell', { name: '8' }).nth(1).click();
  await page.getByRole('link', { name: 'Chat' }).click();
  await page.getByRole('button', { name: 'TT test Team' }).first().click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'My Day' }).click();
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('link', { name: '📁 Openplan application This' }).click();
});
