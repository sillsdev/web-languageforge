import { expect, test } from '@playwright/test';
import { loginAs } from './login';

import constants from '../app/testConstants.json';

test('Login with helper function', async ({ page }) => {
  await loginAs(page, 'admin');
  const userDropdown = page.locator('#userDropdown');
  await expect(userDropdown).toContainText(constants.adminUsername);
});

test.describe('Already logged in as admin', () => {
  test.use({ storageState: 'admin-storageState.json' });
  test('Should already be logged in', async ({ page }) => {
    await page.goto('/app/projects');
    const userDropdown = page.locator('#userDropdown');
    await expect(userDropdown).toContainText(constants.adminUsername);
  });
});

test.describe('Already logged in as manager', () => {
  test.use({ storageState: 'manager-storageState.json' });
  test('Should already be logged in', async ({ page }) => {
    await page.goto('/app/projects');
    const userDropdown = page.locator('#userDropdown');
    await expect(userDropdown).toContainText(constants.managerUsername);
  });
});

test.describe('Already logged in as member', () => {
  test.use({ storageState: 'member-storageState.json' });
  test('Should already be logged in', async ({ page }) => {
    await page.goto('/app/projects');
    const userDropdown = page.locator('#userDropdown');
    await expect(userDropdown).toContainText(constants.memberUsername);
  });
});
