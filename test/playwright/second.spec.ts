import { expect, test } from '@playwright/test';
import { loginAs } from './login';

test('Login with helper function', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('http://app-for-e2e/');
  const title = page.locator('section#banner h2');
  await expect(title).toBeHidden();
});
