import { expect, test } from '@playwright/test';
import { loginAs } from './login';

import constants from '../app/testConstants.json';

test('Login with helper function', async ({ page }) => {
  test.skip(true, 'auto-login means /auth/login auto-redirects to /app/projects');
  await loginAs(page, 'admin');
  const userDropdown = page.locator('#userDropdown');
  await expect(userDropdown).toContainText(constants.adminUsername);
});

test('Should already be logged in', async ({ page }) => {
  await page.goto('/app/projects');
  const userDropdown = page.locator('#userDropdown');
  await expect(userDropdown).toContainText(constants.adminUsername);
});
