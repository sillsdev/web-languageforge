import { expect, test } from '@playwright/test';

test('Login', async ({ page }) => {
  // Go to https://localhost/
  await page.goto('https://localhost/');
  // Click #banner >> text=Login
  await page.locator('#banner >> text=Login').click();
  await expect(page).toHaveURL('https://localhost/auth/login');
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
  // Now https://localhost/ should not be the banner page
  await page.goto('https://localhost/');
  const title = page.locator('section#banner h2');
  await expect(title).toBeHidden();
});
