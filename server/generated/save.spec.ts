import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://beta.openplanai.com/login');
  await page.getByRole('textbox', { name: 'Work Email' }).click();
  await page.getByRole('textbox', { name: 'Work Email' }).fill('rajeshbirlangi2000@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Rajesh@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { description: 'Projects', exact: true }).click();
  await page.getByRole('link', { name: '📁 Openplan application This' }).click();
  await page.getByRole('main').click();
  await page.getByRole('link', { description: 'Projects', exact: true }).click();
});