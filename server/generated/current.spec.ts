import { test, expect } from '@playwright/test';


import fs from 'fs';
test.use({
  storageState: '/Users/pavantejagurajapu/Downloads/playwright/automatest/server/.auth/storage-state.json'
});

test('test', async ({ page }) => {
  await page.goto('https://beta.openplanai.com/');
  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('link', { name: 'Projects', exact: true }).click();
  await page.getByRole('link', { name: '📁 dfgfgd dgdfg Concept' }).click();
  await page.getByRole('button', { name: 'Add Part' }).click();
  await page.getByRole('button', { name: 'Add Manually Create one new' }).click();
  await page.getByRole('textbox', { name: 'e.g. EV-PWR-' }).click();
  await page.getByRole('textbox', { name: 'e.g. EV-PWR-' }).fill('sfsfggsfff');
  await page.getByRole('button', { name: 'Approved' }).click();
  await page.getByRole('textbox', { name: 'e.g. Power Module' }).click();
  await page.getByRole('textbox', { name: 'e.g. Power Module' }).fill('sdfggsfsfd');
  await page.getByRole('textbox', { name: 'Brief technical description' }).click();
  await page.getByRole('textbox', { name: 'e.g. Power Module' }).fill('sdfshfsfdsd');
  await page.getByRole('textbox', { name: 'Brief technical description' }).fill('fsdhhf');
  await page.getByRole('button', { name: 'Select project member…' }).click();
  await page.getByLabel('Project Members').getByText('RRajeshBirlangi').click();
  await page.getByRole('button', { name: 'Control' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'e.g. Texas Instruments' }).click();
  await page.getByRole('textbox', { name: 'e.g. Texas Instruments' }).fill('sdfs');
  await page.getByRole('textbox', { name: 'e.g. TI-A4B2C' }).click();
  await page.getByRole('textbox', { name: 'e.g. TI-A4B2C' }).fill('sdfsdf');
  await page.getByRole('button', { name: 'Weeks' }).click();
  await page.getByRole('textbox', { name: '8' }).click();
  await page.getByRole('textbox', { name: '8' }).fill('3');
  await page.getByRole('button', { name: 'SET' }).click();
  await page.getByRole('textbox', { name: 'e.g. Digi-Key' }).click();
  await page.getByRole('textbox', { name: 'e.g. Digi-Key' }).fill('sadasd');
  await page.getByRole('textbox', { name: '0.00' }).click();
  await page.getByRole('textbox', { name: '0.00' }).fill('3223');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'e.g. SYS-' }).click();
  await page.getByRole('textbox', { name: 'e.g. SYS-' }).fill('sdfsd');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByText('Click to upload product photoPNG, JPG, WEBP · max 10 MB').click();
  if (fs.existsSync('Image (1).jpeg')) {
    await page.locator('input[type="file"]').first().setInputFiles('Image (1).jpeg');
  } else {
    // File 'Image (1).jpeg' was not found in the workspace. Waiting for manual upload...
    await page.waitForFunction(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
      return inputs.some(input => input.files && input.files.length > 0);
    }, undefined, { timeout: 0 });
  }
  await page.getByRole('button', { name: 'Add Part' }).click();
  await page.getByRole('button', { name: 'Delete part' }).nth(1).click();
  await page.getByRole('button', { name: 'Delete Part' }).click();
});