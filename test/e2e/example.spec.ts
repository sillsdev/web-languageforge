import { expect } from '@playwright/test';
import constants from './testConstants.json';
import { test } from './utils/fixtures';
import { testControl } from './utils/jsonrpc';
import { addLexEntry, initTestProject } from './utils/testSetup';

test.skip('Reset project', async ({ request }) => {
  await initTestProject(request,
    constants.testProjectCode,
    constants.testProjectName,
    constants.adminUsername,
  );
});

test.skip('Reset project and add test data', async ({ request, adminTab }) => {
  await initTestProject(request,
    constants.testProjectCode,
    constants.testProjectName,
    constants.managerUsername,
  );
  // Lexical entry from testConstants.json with no changes
  await addLexEntry(request, constants.testProjectCode, constants.testEntry1);
  // Example of adding data in the custom field
  const data = {
    ...constants.testEntry2,
    customFields: {
    }
  };
  // The [customFieldName] syntax is how you can assign a property without knowing it at compile-time
  // console.log(data); // Uncomment this to see the data you're adding
  await addLexEntry(request, constants.testProjectCode, data);

  const projectId = await testControl(request, 'init_test_project', [
    constants.testProjectCode,
    constants.testProjectName,
    constants.adminUsername,
  ]);
  await adminTab.goto('/app/projects');
  await expect(adminTab.locator(`[data-ng-repeat="project in visibleProjects"] a:has-text("${constants.testProjectName}")`)).toBeVisible();
  await adminTab.goto(`/app/projects/${projectId}`);
  // await adminTab.screenshot({ path: 'post-login.png' });
});
