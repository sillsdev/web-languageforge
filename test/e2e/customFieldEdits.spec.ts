import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import constants from './testConstants.json';
import { test } from './utils/fixtures';
import { testControl } from './utils/jsonrpc';
import { addLexEntry } from './utils/testSetup';
import { addCustomField, getProjectJson } from './utils/testSetup';

test('API call', async ({ request }: { request: APIRequestContext }) => {
  const result = await testControl(request, 'check_test_api');
  expect(result).toBeDefined();
  expect(result).toHaveProperty('api_is_working');
  expect(result.api_is_working).toBeTruthy();
});

test('Reset project', async ({ request }: { request: APIRequestContext }) => {
  await testControl(request, 'reset_projects');
  const result = await testControl(request, 'init_test_project', [
    constants.testProjectCode,
    constants.testProjectName,
    constants.adminUsername,
  ]);
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

test.only('Try this', async ({request}) => {
  // const data = { ...constants.testEntry1, id: '' };
  // const d = new Date();
  // const uniqueId = '_new_' + d.getSeconds() + d.getMilliseconds();
  console.log('Calling PHP with data', constants.testEntry1);
  const result = await addLexEntry(request, constants.testProjectCode, constants.testEntry1);
  console.log('Result was', result);
});
