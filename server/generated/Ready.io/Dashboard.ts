import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('link', { name: 'Reports' }).click();
  await page.getByRole('link', { name: 'Chat' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'My Day' }).click();
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('link', { name: '📁 Openplan application This' }).click();
  await page.getByRole('tab', { name: 'Tasks' }).click();
  await page.getByRole('button', { name: 'Add Task' }).first().click();
  await page.getByRole('textbox', { name: 'Task title...' }).click();
  await page.getByRole('textbox', { name: 'Task title...' }).fill('loved it ');
  await page.getByRole('textbox', { name: 'Describe the task in detail...' }).click();
  await page.getByRole('textbox', { name: 'Task title...' }).fill('loved it s');
  await page.getByRole('textbox', { name: 'Describe the task in detail...' }).fill('jakhsd');
  await page.getByText('CancelCreate Task').click();
  await page.getByText('CancelCreate Task').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
});