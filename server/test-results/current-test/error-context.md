
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: current.spec.ts >> test
- Location: generated/current.spec.ts:7:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a[href="/projects"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img "OpenPlan AI" [ref=e8]
        - generic [ref=e12]: OpenPlan AI
      - heading "Streamline your hardware product development" [level=1] [ref=e13]
      - paragraph [ref=e14]: Track projects, manage dependencies, and ship products faster with AI-powered insights.
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: 50%
          - generic [ref=e18]: Faster delivery
        - generic [ref=e20]:
          - generic [ref=e21]: 10k+
          - generic [ref=e22]: Projects managed
        - generic [ref=e24]:
          - generic [ref=e25]: 99.9%
          - generic [ref=e26]: Uptime
    - generic [ref=e28]:
      - generic [ref=e29]:
        - heading "Welcome back" [level=3] [ref=e30]
        - paragraph [ref=e31]: Enter your credentials to access your account
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - text: Work Email
            - generic [ref=e35]:
              - img [ref=e36]
              - textbox "Work Email" [ref=e39]:
                - /placeholder: you@company.com
          - generic [ref=e40]:
            - generic [ref=e41]:
              - generic [ref=e42]: Password
              - link "Forgot password?" [ref=e43] [cursor=pointer]:
                - /url: /forgot-password
            - generic [ref=e44]:
              - img [ref=e45]
              - textbox "Password" [ref=e48]:
                - /placeholder: Enter your password
              - button "Show password" [ref=e49] [cursor=pointer]:
                - img [ref=e50]
        - generic [ref=e53]:
          - button "Sign in" [ref=e54] [cursor=pointer]:
            - text: Sign in
            - img
          - paragraph [ref=e55]:
            - text: Don't have an account?
            - link "Create account" [ref=e56] [cursor=pointer]:
              - /url: /signup
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.use({
  4  |   storageState: '/Users/pavantejagurajapu/Downloads/playwright/automatest/server/.auth/storage-state.json'
  5  | });
  6  | 
  7  | test('test', async ({ page }) => {
  8  |   await page.goto('https://beta.openplanai.com/');
> 9  |   await page.locator('a[href="/projects"]').click();
     |                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  10 |   await page.locator('a[href="/team"]').click();
  11 |   await page.getByRole('textbox', { name: 'Search by Name or Email' }).click();
  12 |   await page.getByRole('link').nth(1).click();
  13 |   await page.locator('a[href="/chat"]').click();
  14 |   await page.locator('.lucide.lucide-message-square.h-7').click();
  15 |   await page.locator('a[href="/settings"]').click();
  16 | });
```