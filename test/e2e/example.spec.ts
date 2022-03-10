import { expect, Page, test } from '@playwright/test';
import constants from '../app/testConstants.json';
import { testControl } from './jsonrpc';
import { login } from './login';

test('API call', async ({ request }) => {
  const result = await testControl(request, 'check_test_api');
  expect(result).toBeDefined();
  expect(result).toHaveProperty('api_is_working');
  expect(result.api_is_working).toBeTruthy();
});

test('Reset project', async ({ request, page }) => {
  const result = await testControl(request, 'init_test_project');
  await login(page, constants.adminUsername, constants.adminPassword);
  await page.screenshot({ path: 'post-login.png' });
});
