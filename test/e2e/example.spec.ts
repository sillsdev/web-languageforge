import type { APIRequestContext, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import constants from '../app/testConstants.json';
import { testControl } from './jsonrpc';
import { login } from './login';

test('API call', async ({ request }: { request: APIRequestContext }) => {
  const result = await testControl(request, 'check_test_api');
  expect(result).toBeDefined();
  expect(result).toHaveProperty('api_is_working');
  expect(result.api_is_working).toBeTruthy();
});

test('Reset project', async ({ request, page }: { request: APIRequestContext, page: Page }) => {
  const adminId = await testControl(request, 'create_user', [
    constants.adminUsername,
    constants.adminName,
    constants.adminPassword,
    constants.adminEmail,
  ]);
  const result = await testControl(request, 'init_test_project', [
    constants.testProjectCode,
    constants.testProjectName,
    constants.adminUsername,
  ]);
  await login(page, constants.adminUsername, constants.adminPassword);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'post-login.png' });
});
