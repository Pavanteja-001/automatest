import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.reaidy.io/');
  await page.locator('.relative.w-20').click();
  await page.locator('.relative.w-20').click();
  await page.getByRole('button', { name: 'MERN' }).click();
  await page.getByRole('button', { name: 'Java' }).click();
  await page.getByRole('button', { name: 'AI/ML' }).click();
  await page.getByRole('button', { name: 'Digital marketing' }).click();
  await page.getByRole('button', { name: 'Business Development' }).click();
});





