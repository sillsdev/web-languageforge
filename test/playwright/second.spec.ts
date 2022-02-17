import { expect, test } from '@playwright/test';
import { loginAs } from './login';

test('Login', async ({ page }) => {
  // Go to http://app-for-e2e/
  await page.goto('http://app-for-e2e/');
  // Click #banner >> text=Login
  await page.locator('#banner >> text=Login').click();
  await expect(page).toHaveURL('http://app-for-e2e/auth/login');
  // Click input[name="_username"]
  await page.locator('input[name="_username"]').click();
  // Fill input[name="_username"]
  await page.locator('input[name="_username"]').fill('admin');
  // Click input[name="_password"]
  await page.locator('input[name="_password"]').click();
  // Fill input[name="_password"]
  await page.locator('input[name="_password"]').fill('password');
  // Click button:has-text("Login")
  await Promise.all([
    page.waitForNavigation(),
    page.locator('button:has-text("Login")').click()
  ]);
  // Now http://app-for-e2e/ should not be the banner page
  await page.goto('http://app-for-e2e/');
  const title = page.locator('section#banner h2');
  await expect(title).toBeHidden();
});

test('Login with helper function', async ({ page }) => {
  await loginAs(page, 'admin');
  // Note that this will *fail* when run on local dev machine. Would have to be inside e2e container for this to work.

  // Rest of this test fails because the password is wrong for the local dev machine.
  await page.goto('http://app-for-e2e/');
  const title = page.locator('section#banner h2');
  await expect(title).toBeHidden();
});
