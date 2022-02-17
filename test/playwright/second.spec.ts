import { expect, test } from '@playwright/test';
import { loginAs } from './login';
import constants from '../app/testConstants.json';

test('Login with helper function', async ({ page }) => {
  await loginAs(page, 'admin');
  const userDropdown = page.locator('#userDropdown');
  await expect(userDropdown).toContainText(constants.adminUsername);
});
