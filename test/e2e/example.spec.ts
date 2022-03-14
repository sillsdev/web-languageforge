import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import constants from '../app/testConstants.json';
import { testControl } from './jsonrpc';
import type { UserTab } from './fixtures';
import { test } from './fixtures';

test('API call', async ({ request }: { request: APIRequestContext }) => {
  const result = await testControl(request, 'check_test_api');
  expect(result).toBeDefined();
  expect(result).toHaveProperty('api_is_working');
  expect(result.api_is_working).toBeTruthy();
});

test('Reset project', async ({ request, adminTab }: { request: APIRequestContext, adminTab: UserTab }) => {
  const result = await testControl(request, 'init_test_project', [
    constants.testProjectCode,
    constants.testProjectName,
    constants.adminUsername,
  ]);
  await adminTab.goto('/app/projects');
  await expect(adminTab.locator(`[data-ng-repeat="project in visibleProjects"] a:has-text("${constants.testProjectName}")`)).toBeVisible();
  // await adminTab.screenshot({ path: 'post-login.png' });
});
