import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.reaidy.io/');
  await page.locator('.absolute.top-1').click();
  await page.getByRole('textbox', { name: 'Eg: Software Engineer' }).click();
  await page.getByRole('textbox', { name: 'Eg: Software Engineer' }).fill('mern');
  await page.getByRole('textbox', { name: 'Eg: Software Engineer' }).press('Enter');
  await page.getByRole('textbox', { name: 'Eg: Software Engineer' }).click();
  await page.goto('https://www.reaidy.io/recruiter/applicant/69665557668411f2bf6d5566');
});