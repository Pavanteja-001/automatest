import { test, expect } from '@playwright/test';

const BASE_URL = 'https://beta.openplanai.com';
const VALID_EMAIL = 'rajeshbirlangi2000@gmail.com';
const VALID_PASSWORD = 'Rajesh@123';

async function gotoLogin(page) {
    await page.goto(`${BASE_URL}/login`);
}

async function fillLogin(page, email: string, password: string) {
    await page.getByRole('textbox', { name: 'Work Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
}

async function clickLogin(page) {
    await page.getByRole('button', { name: 'Sign in' }).click();
}

test.describe('Login Test Suite', () => {

    test.beforeEach(async ({ page }) => {
        await gotoLogin(page);
    });

    test('01 - Valid Login', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        await expect(page).not.toHaveURL(/login/);
    });

    test('02 - Invalid Password', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, 'WrongPassword123');
        await clickLogin(page);

        await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible();
    });

    test('03 - Invalid Email', async ({ page }) => {
        await fillLogin(page, 'wrong@gmail.com', VALID_PASSWORD);
        await clickLogin(page);

        await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible();
    });

    test('04 - Invalid Email and Password', async ({ page }) => {
        await fillLogin(page, 'wrong@gmail.com', 'wrongpassword');
        await clickLogin(page);

        await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible();
    });

    test('05 - Empty Email', async ({ page }) => {
        await fillLogin(page, '', VALID_PASSWORD);
        await clickLogin(page);

        await expect(page.getByText(/email.*required/i)).toBeVisible();
    });

    test('06 - Empty Password', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, '');
        await clickLogin(page);

        await expect(page.getByText(/password.*required/i)).toBeVisible();
    });

    test('07 - Empty Email and Password', async ({ page }) => {
        await clickLogin(page);

        await expect(page.getByText(/required/i)).toBeVisible();
    });

    test('08 - Invalid Email Format', async ({ page }) => {
        await fillLogin(page, 'abcd', VALID_PASSWORD);
        await clickLogin(page);

        await expect(page.getByText(/invalid email/i)).toBeVisible();
    });

    test('09 - Email With Leading Spaces', async ({ page }) => {
        await fillLogin(page, '   ' + VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        await expect(page).not.toHaveURL(/login/);
    });

    test('10 - Email With Trailing Spaces', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL + '   ', VALID_PASSWORD);
        await clickLogin(page);

        await expect(page).not.toHaveURL(/login/);
    });

    test('11 - Email Case Insensitive', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL.toUpperCase(), VALID_PASSWORD);
        await clickLogin(page);

        await expect(page).not.toHaveURL(/login/);
    });

    test('12 - Password Case Sensitive', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD.toLowerCase());
        await clickLogin(page);

        await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
    });

    test('13 - Password Field Is Hidden', async ({ page }) => {
        const password = page.getByRole('textbox', { name: 'Password' });

        await expect(password).toHaveAttribute('type', 'password');
    });

    test('14 - Login Using Enter Key', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);

        await page.keyboard.press('Enter');

        await expect(page).not.toHaveURL(/login/);
    });

    test('15 - Tab Navigation', async ({ page }) => {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
    });

    test('16 - Multiple Rapid Clicks', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);

        const button = page.getByRole('button', { name: 'Sign in' });

        await Promise.all([
            button.click(),
            button.click(),
            button.click()
        ]);

        await expect(page).not.toHaveURL(/login/);
    });

    test('17 - Refresh After Login', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        await page.reload();

        await expect(page).not.toHaveURL(/login/);
    });

    test('18 - Browser Back After Login', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        await page.goBack();

        await expect(page).not.toHaveURL(/login/);
    });

    test('19 - Long Email', async ({ page }) => {
        const email =
            `${'a'.repeat(250)}@gmail.com`;

        await fillLogin(page, email, VALID_PASSWORD);
        await clickLogin(page);

        await expect(page.getByText(/invalid|too long/i)).toBeVisible();
    });

    test('20 - Long Password', async ({ page }) => {
        const password = 'A'.repeat(500);

        await fillLogin(page, VALID_EMAIL, password);
        await clickLogin(page);

        await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
    });

    test('21 - SQL Injection Attempt', async ({ page }) => {
        await fillLogin(page, "' OR 1=1 --", "' OR 1=1 --");
        await clickLogin(page);

        await expect(page.getByText(/invalid|incorrect/i)).toBeVisible();
    });

    test('22 - XSS Attempt', async ({ page }) => {
        await fillLogin(page, '<script>alert(1)</script>', 'password');
        await clickLogin(page);

        await expect(page.getByText(/invalid|email/i)).toBeVisible();
    });

    test('23 - Network Failure', async ({ page }) => {
        await page.route('**/login**', route => route.abort());

        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        await expect(page.getByText(/network|failed|error/i)).toBeVisible();
    });

    test('24 - Server Error 500', async ({ page }) => {
        await page.route('**/login**', route =>
            route.fulfill({
                status: 500,
                body: 'Internal Server Error'
            })
        );

        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        await expect(page.getByText(/server|error/i)).toBeVisible();
    });

    test('25 - Login API Returns 200', async ({ page }) => {

        const responsePromise = page.waitForResponse(res =>
            res.url().includes('/login') &&
            res.status() === 200
        );

        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        await responsePromise;
    });

    test('26 - Cookie Created', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        const cookies = await page.context().cookies();

        expect(cookies.length).toBeGreaterThan(0);
    });

    test('27 - Local Storage Token Exists', async ({ page }) => {
        await fillLogin(page, VALID_EMAIL, VALID_PASSWORD);
        await clickLogin(page);

        const token = await page.evaluate(() =>
            localStorage.getItem('token')
        );

        expect(token).not.toBeNull();
    });

    test('28 - Login Button Visible', async ({ page }) => {
        await expect(
            page.getByRole('button', { name: 'Sign in' })
        ).toBeVisible();
    });

    test('29 - Email Field Visible', async ({ page }) => {
        await expect(
            page.getByRole('textbox', { name: 'Work Email' })
        ).toBeVisible();
    });

    test('30 - Password Field Visible', async ({ page }) => {
        await expect(
            page.getByRole('textbox', { name: 'Password' })
        ).toBeVisible();
    });

});