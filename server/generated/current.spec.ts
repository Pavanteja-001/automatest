import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.irootforsatyadev.com/');
  await page.getByRole('button', { name: 'Yes ❤️' }).click();
  await page.getByRole('textbox', { name: 'Share your thoughts...' }).click();
  await page.getByRole('textbox', { name: 'Share your thoughts...' }).fill('thakur....');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Next chevron_right' }).click();
  await page.getByRole('textbox', { name: 'Enter your name...' }).click();
  await page.getByRole('textbox', { name: 'Enter your name...' }).fill('thakur');
  await page.getByRole('button', { name: 'Prepare Portrait Kit' }).click();
  await page.getByRole('button', { name: 'chevron_backward' }).click();
});