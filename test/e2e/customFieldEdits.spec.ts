import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import constants from './testConstants.json';
import { testControl } from './utils/jsonrpc';
import type { UserTab } from './utils/fixtures';
import { test } from './utils/fixtures';
import { addCustomField, getProjectJson } from './utils/testSetup';

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
  // await adminTab.goto('/app/projects');
  // await expect(adminTab.locator(`[data-ng-repeat="project in visibleProjects"] a:has-text("${constants.testProjectName}")`)).toBeVisible();
  // await adminTab.screenshot({ path: 'post-login.png' });
  const json = await getProjectJson(request, constants.testProjectCode);
  expect(json.projectCode).toEqual(constants.testProjectCode);
  expect(json.missingProp).toBeUndefined();
});

test('Create custom field', async ({ request }: { request: APIRequestContext }) => {
  const result = await addCustomField(request, constants.testProjectCode, 'customField_entry_Foo');
  const json = await getProjectJson(request, constants.testProjectCode);
  expect(json?.config?.roleViews?.project_manager?.fields?.customField_entry_Foo).toBeDefined();
  expect(json?.config?.roleViews?.project_manager?.fields?.customField_entry_Foo?.type).toEqual('multitext');
});

test('Second test', async ({ request }: { request: APIRequestContext }) => {
  const result = await testControl(request, 'new_method');
  console.log(result);
  expect(result).toBe('hello');
});
