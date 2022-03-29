import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import constants from './testConstants.json';
import { test } from './utils/fixtures';
import { testControl } from './utils/jsonrpc';
import { addCustomField, addLexEntry, getProjectJson } from './utils/testSetup';

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
  const result = await addCustomField(request, constants.testProjectCode, 'customField_entry_Foo', 'entry', 'MultiString', {inputSystems: ['th']});
  const json = await getProjectJson(request, constants.testProjectCode);
  expect(json?.config?.roleViews?.project_manager?.fields?.customField_entry_Foo).toBeDefined();
  expect(json?.config?.roleViews?.project_manager?.fields?.customField_entry_Foo?.type).toEqual('multitext');
});

test('Second test', async ({ request }: { request: APIRequestContext }) => {
  const result = await testControl(request, 'new_method');
  console.log(result);
  expect(result).toBe('hello');
});

test('Try this', async ({request}) => {
  const data = { ...constants.testEntry1 } as any;
  data.customFields = {
    customField_entry_Foo: { th: { value: 'something' } }
  };
  // const d = new Date();
  // const uniqueId = '_new_' + d.getSeconds() + d.getMilliseconds();
  console.log('Calling PHP with data', data);
  const result = await addLexEntry(request, constants.testProjectCode, data);
  console.log('Result was', result);
});

test.describe.only('Custom fields', () => {
  let projectId: string;
  test.beforeEach(async ({ request }) => {
    projectId = await testControl(request, 'init_test_project', [
      constants.testProjectCode,
      constants.testProjectName,
      constants.managerUsername,
      [constants.memberUsername, constants.member2Username],
    ]);
    await addCustomField(request, constants.testProjectCode, 'CustomField', 'entry', 'MultiString', {inputSystems: ['th']});
    const data = { ...constants.testEntry1 } as any;
    data.customFields = {
      customField_entry_Foo: { th: { value: 'something' } }
    };
    await addLexEntry(request, constants.testProjectCode, data);
  });

  const run = async (...list: Array<Promise<any>>) => await Promise.all(list);

  test('Custom fields with two users', async ({ managerTab, memberTab }) => {
    await run(managerTab.goto(`/app/lexicon/${projectId}`), memberTab.goto(`/app/lexicon/${projectId}`));
    await run(managerTab.locator('text=CustomField').nth(0).click(), memberTab.locator('text=CustomField').nth(0).click());
  });
});
