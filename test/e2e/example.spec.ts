import constants from './testConstants.json';
import { test } from './utils/fixtures';
import { addCustomField, addLexEntry, initTestProject } from './utils/testSetup';

test.skip('Reset project', async ({ request }) => {
  await initTestProject(request,
    constants.testProjectCode,
    constants.testProjectName,
    constants.adminUsername,
  );
});

test.skip('Reset project and add test data', async ({ request }) => {
  await initTestProject(request,
    constants.testProjectCode,
    constants.testProjectName,
    constants.managerUsername,
  );
  const customFieldName = await addCustomField(request,
    constants.testProjectCode,
    'CustomField',
    'entry',
    'MultiString',
    {inputSystems: ['th']}
  );
  // Lexical entry from testConstants.json with no changes
  await addLexEntry(request, constants.testProjectCode, constants.testEntry1);
  // Example of adding data in the custom field
  const data = {
    ...constants.testEntry2,
    customFields: {
      [customFieldName]: { th: { value: 'contents of custom field' } }
    }
  };
  // The [customFieldName] syntax is how you can assign a property without knowing it at compile-time
  // console.log(data); // Uncomment this to see the data you're adding
  await addLexEntry(request, constants.testProjectCode, data);
});
