import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://vaultrag-ivory.vercel.app/login');
  await page.getByRole('textbox', { name: 'you@yourteam.dev' }).click();
  await page.getByRole('textbox', { name: 'you@yourteam.dev' }).fill('l1@vaultrag.dev');
  await page.getByRole('textbox', { name: 'you@yourteam.dev' }).press('Enter');
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('password123');
  await page.getByRole('button', { name: 'Access Vault' }).click();
  await page.getByRole('textbox', { name: 'Ask anything about the' }).click();
  await page.getByRole('textbox', { name: 'Ask anything about the' }).fill('hi');
  await page.getByRole('button', { name: 'New Chat' }).click();
  await page.getByRole('textbox', { name: 'Ask anything about the' }).click();
  await page.getByRole('textbox', { name: 'Ask anything about the' }).fill('hi');
  await page.getByRole('link', { name: 'My To-Dos' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
});