import { expect, test } from '@playwright/test';
import { loginAs } from './login';
import { mkdtemp } from 'fs/promises';
import os from 'os';
import path from 'path';

import constants from '../app/testConstants.json';

test('Login with helper function', async ({ page }) => {
  await loginAs(page, 'admin');
  const userDropdown = page.locator('#userDropdown');
  await expect(userDropdown).toContainText(constants.adminUsername);
});

test.only('Login with API', async ({ browser, request }) => {
  // Use API to log in the user (saves time vs. submitting login form)
  const tmpdir = await mkdtemp(path.join(os.tmpdir(), 'playwright-'));
  const stateFile = path.join(tmpdir, 'storageState.json');
  const response = await request.post('/auth/login', {
    data: {
      username: constants.adminUsername,
      password: constants.adminPassword,
    }
  });
  expect(response.ok()).toBeTruthy();
  await request.storageState({ path: stateFile });

  // Now load page and verify user is logged in
  const context = await browser.newContext({ storageState: stateFile });
  const page = await context.newPage();
  await page.goto('/app/projects');
  const userDropdown = page.locator('#userDropdown');
  await expect(userDropdown).toContainText(constants.adminUsername);
});
