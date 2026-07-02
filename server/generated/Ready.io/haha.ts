import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://beta.openplanai.com/login');
  await page.getByRole('textbox', { name: 'Work Email' }).click();
  await page.getByRole('textbox', { name: 'Work Email' }).fill('rajeshbirlangi2000@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Rajesh@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'All projects' }).click();
  await page.getByRole('link', { name: '📁 test sdfsdf Concept' }).click();
  await page.getByRole('link', { description: 'Dashboard', exact: true }).click();
  await page.getByRole('link', { description: 'My Day', exact: true }).click();
  await page.getByRole('link', { description: 'Chat', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search conversations...' }).click();
  await page.getByRole('textbox', { name: 'Search conversations...' }).fill('');
  await page.getByRole('button', { name: 'OA Openplan application Team' }).click();
  await page.getByRole('button', { name: '1 1234567 3d Brett Cooper:' }).click();
  await page.getByRole('button', { name: 'Sekhar javvadi Sekhar javvadi' }).click();
  await page.getByRole('button', { name: 'New Message' }).click();
  await page.getByRole('button', { name: 'JT Jagan Tripuragiri' }).click();
  await page.getByRole('button', { name: 'New Group' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
});  