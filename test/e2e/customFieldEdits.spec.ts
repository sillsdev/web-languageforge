import { expect } from '@playwright/test';
import constants from './testConstants.json';
import { test } from './utils/fixtures';
import { testControl } from './utils/jsonrpc';
import { addCustomField, addLexEntry, getProjectJson } from './utils/testSetup';

test.describe('Custom fields', () => {
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
      customField_entry_CustomField: { th: { value: 'something' } }
    };
    await addLexEntry(request, constants.testProjectCode, data);
    const json = await getProjectJson(request, constants.testProjectCode);
    expect(json?.config?.roleViews?.project_manager?.fields?.customField_entry_CustomField).toBeDefined();
    expect(json?.config?.roleViews?.project_manager?.fields?.customField_entry_CustomField?.type).toEqual('multitext');
    expect(json?.config?.roleViews?.project_manager?.fields?.customField_entry_CustomField?.show).toBeTruthy();
    expect(json?.config?.roleViews?.contributor?.fields?.customField_entry_CustomField?.show).toBeTruthy();
    expect(json?.config?.entry?.fields?.customField_entry_CustomField?.inputSystems).toBeDefined();
    expect(json?.config?.entry?.fields?.customField_entry_CustomField?.inputSystems.length).toBeGreaterThan(0);
    expect(json?.config?.entry?.fields?.customField_entry_CustomField?.inputSystems).toContainEqual('th');
  });

  const run = async (...list: Array<Promise<any>>) => await Promise.all(list);

  test('Custom fields with two users', async ({ managerTab, memberTab }) => {
    await run(managerTab.goto(`/app/lexicon/${projectId}`), memberTab.goto(`/app/lexicon/${projectId}`));
    await run(managerTab.locator('text=CustomField').nth(0).click(), memberTab.locator('text=CustomField').nth(0).click());
  });
});
