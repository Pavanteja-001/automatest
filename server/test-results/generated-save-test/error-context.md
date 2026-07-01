# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: generated/save.spec.ts >> test
- Location: generated/save.spec.ts:3:5

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('link', { description: 'Projects', exact: true })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('test', async ({ page }) => {
  4  |   await page.goto('https://beta.openplanai.com/login');
  5  |   await page.getByRole('textbox', { name: 'Work Email' }).click();
  6  |   await page.getByRole('textbox', { name: 'Work Email' }).fill('rajeshbirlangi2000@gmail.com');
  7  |   await page.getByRole('textbox', { name: 'Password' }).click();
  8  |   await page.getByRole('textbox', { name: 'Password' }).fill('Rajesh@123');
  9  |   await page.getByRole('button', { name: 'Sign in' }).click();
> 10 |   await page.getByRole('link', { description: 'Projects', exact: true }).click();
     |                                                                          ^ Error: locator.click: Target page, context or browser has been closed
  11 |   await page.getByRole('link', { name: '📁 Openplan application This' }).click();
  12 |   await page.getByRole('main').click();
  13 |   await page.getByRole('link', { description: 'Projects', exact: true }).click();
  14 | });
```