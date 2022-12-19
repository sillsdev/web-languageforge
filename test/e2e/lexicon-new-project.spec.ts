import { expect } from '@playwright/test';
import { sendReceiveMockProjects, sendReceiveMockUser, users } from './constants';
import { EditorPage } from './pages/editor.page';
import { NewLexProjectPage } from './pages/new-lex-project.page';
import { testFilePath, toProject } from './utils';
import { test } from './utils/fixtures';
import { initTestProjectForTest } from './utils/testSetup';

test.describe('New Project wizard', () => {

  test('Admin can get to wizard', async ({ adminTab }) => {
    const newLexProjectPageAdmin: NewLexProjectPage = new NewLexProjectPage(adminTab);
    await newLexProjectPageAdmin.goto();
    await expect(newLexProjectPageAdmin.chooserPage.createButton).toBeVisible();
  });

  test('Manager can get to wizard', async ({ managerTab }) => {
    const newLexProjectPageManager: NewLexProjectPage = new NewLexProjectPage(managerTab);
    await newLexProjectPageManager.goto();
    await expect(newLexProjectPageManager.chooserPage.createButton).toBeVisible();
  });

  test('Setup: user login and page contains a form', async ({ memberTab }) => {
    const newLexProjectPageMember = await NewLexProjectPage.goto(memberTab);
    await expect(newLexProjectPageMember.chooserPage.createButton).toBeVisible();
  });

  // step 0: chooser
  test.describe('Chooser page', () => {

    let newLexProjectPageMember: NewLexProjectPage;

    test.beforeEach(async ({ memberTab }) => {
      newLexProjectPageMember = await NewLexProjectPage.goto(memberTab);
    });

    test('Cannot see Back or Next buttons', async () => {
      await expect(newLexProjectPageMember.backButton).not.toBeVisible();
      await expect(newLexProjectPageMember.nextButton).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();
    });

    test('Can navigate to new project form and back', async () => {
      await expect(newLexProjectPageMember.chooserPage.createButton).toBeEnabled();
      await newLexProjectPageMember.chooserPage.createButton.click();
      await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();

      // Can go back to Chooser page
      await expect(newLexProjectPageMember.backButton).toBeVisible();
      await newLexProjectPageMember.backButton.click();
      await expect(newLexProjectPageMember.chooserPage.sendReceiveButton).toBeVisible();
    });

    test('Can navigate to Send and Receive form and back', async () => {
      await expect(newLexProjectPageMember.chooserPage.sendReceiveButton).toBeEnabled();
      await newLexProjectPageMember.chooserPage.sendReceiveButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toHaveValue(users.member.username);
      await expect(newLexProjectPageMember.srCredentialsPage.passwordInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();

      // Can go back to Chooser page
      await expect(newLexProjectPageMember.backButton).toBeVisible();
      await newLexProjectPageMember.backButton.click();
      await expect(newLexProjectPageMember.chooserPage.sendReceiveButton).toBeVisible();
    });
  });

  // step 1: send receive credentials
  test.describe('Send Receive Credentials page', () => {

    let newLexProjectPageMember: NewLexProjectPage;

    test.beforeEach(async ({ memberTab }) => {
      newLexProjectPageMember = await NewLexProjectPage.goto(memberTab);
      await newLexProjectPageMember.chooserPage.sendReceiveButton.click();
    });

    test('Cannot move on if Password is empty', async () => {
      await newLexProjectPageMember.expectFormStatusHasNoError();
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.nextButton.click();

      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('Password cannot be empty.');
    });

    test('Cannot move on if username is incorrect and can go back to Chooser page, user and password preserved', async () => {
      const invalidPassword = 'invalid password';
      await newLexProjectPageMember.srCredentialsPage.passwordInput.type(invalidPassword);
      // tab triggers validation of the password
      await newLexProjectPageMember.srCredentialsPage.passwordInput.press('Tab');
      await expect(newLexProjectPageMember.srCredentialsPage.credentialsInvalid).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.loginOk).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('The username or password isn\'t valid on LanguageDepot.org.');

      // can go back to Chooser page, user and password preserved
      await expect(newLexProjectPageMember.backButton).toBeVisible();
      await newLexProjectPageMember.backButton.click();
      await expect(newLexProjectPageMember.chooserPage.sendReceiveButton).toBeVisible();
      await newLexProjectPageMember.chooserPage.sendReceiveButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toHaveValue(users.member.username);
      await expect(newLexProjectPageMember.srCredentialsPage.passwordInput).toHaveValue(invalidPassword);
    });

    test('Cannot move on if Login is empty', async () => {
      await newLexProjectPageMember.srCredentialsPage.loginInput.fill('');
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('Login cannot be empty.');
    });

    test('Can move on when the credentials are valid but cannot move further if no project is selected', async () => {
      await newLexProjectPageMember.srCredentialsPage.loginInput.fill(sendReceiveMockUser.username);
      await newLexProjectPageMember.srCredentialsPage.passwordInput.type(sendReceiveMockUser.password);
      await expect(newLexProjectPageMember.srCredentialsPage.loginOk).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.passwordOk).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();

      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.srCredentialsPage.loginInput).toBeVisible();
      await expect(newLexProjectPageMember.srCredentialsPage.projectSelect).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('Please select a Project.');
    });

    test('Cannot move on if not a manager of the project', async () => {
      await newLexProjectPageMember.srCredentialsPage.loginInput.fill(sendReceiveMockUser.username);
      await newLexProjectPageMember.srCredentialsPage.passwordInput.type(sendReceiveMockUser.password);
      const proj = sendReceiveMockProjects[2];
      await newLexProjectPageMember.srCredentialsPage.projectSelect.selectOption({ label: `${proj.name} (${proj.id}, contributor)` });
      await expect(newLexProjectPageMember.srCredentialsPage.projectNoAccess).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('select a Project that you are the Manager of');
    });

    test('Can move on when a managed project is selected', async () => {
      await newLexProjectPageMember.srCredentialsPage.loginInput.fill(sendReceiveMockUser.username);
      await newLexProjectPageMember.srCredentialsPage.passwordInput.type(sendReceiveMockUser.password);
      const proj = sendReceiveMockProjects[4];
      await newLexProjectPageMember.srCredentialsPage.projectSelect.selectOption({ label: `${proj.name} (${proj.id}, manager)` });
      await expect(newLexProjectPageMember.srCredentialsPage.projectOk).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();
    });

  });

  // removed test: test tested whether cloning information is visible

  // step 1, 2 & 3
  test.describe('New Project', () => {

    let newLexProjectPageMember: NewLexProjectPage;

    test.beforeEach(async ({ memberTab }) => {
      newLexProjectPageMember = await NewLexProjectPage.goto(memberTab);
      await newLexProjectPageMember.chooserPage.createButton.click();
    });

    // step 1: project name
    test.describe('New Project Name page', () => {
      const unusedProject = toProject('Unused test project name');

      test('Cannot move on if name is invalid', async () => {
        await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();
        await expect(newLexProjectPageMember.nextButton).toBeEnabled();
        await newLexProjectPageMember.nextButton.click();
        await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();
        await newLexProjectPageMember.expectFormStatusHasError();
        await expect(newLexProjectPageMember.formStatus).toContainText('Project Name cannot be empty.');
      });

      test('Finds the test project already exists', async ({}, testInfo) => {
        const existingProject = await initTestProjectForTest(newLexProjectPageMember.request, testInfo, users.manager, [users.member]);

        await newLexProjectPageMember.namePage.projectNameInput.fill(existingProject.code);
        await newLexProjectPageMember.namePage.projectNameInput.press('Tab');
        await expect(newLexProjectPageMember.namePage.projectCodeExists).toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeInput).toHaveValue(existingProject.code);
        await newLexProjectPageMember.expectFormStatusHasError();
        await expect(newLexProjectPageMember.formStatus).toContainText(
          'Another project with code \'' + existingProject.code +
          '\' already exists.');
      });

      test('With a cleared name does not show an error but is still invalid', async () => {
        await newLexProjectPageMember.namePage.projectNameInput.fill('');
        await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
        await newLexProjectPageMember.expectFormStatusHasNoError();
        await expect(newLexProjectPageMember.nextButton).toBeEnabled();
        await newLexProjectPageMember.nextButton.click();
        await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();
        await newLexProjectPageMember.expectFormStatusHasError();
        await expect(newLexProjectPageMember.formStatus).toContainText('Project Name cannot be empty.');
      });

      test('Can verify that an unused project name is available', async () => {
        await newLexProjectPageMember.namePage.projectNameInput.fill(unusedProject.name);
        await newLexProjectPageMember.namePage.projectNameInput.press('Tab');
        await expect(newLexProjectPageMember.namePage.projectCodeOk).toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
        await expect(newLexProjectPageMember.namePage.projectCodeInput).toHaveValue(unusedProject.code);
        await newLexProjectPageMember.expectFormStatusHasNoError();
      });

      test.describe('Project Code tests', () => {
        test.beforeEach(async () => {
          await newLexProjectPageMember.namePage.projectNameInput.fill(unusedProject.name);
        });

        test('Cannot edit project code by default', async () => {
          await expect(newLexProjectPageMember.namePage.projectCodeInput).not.toBeVisible();
        });

        test.describe('Edit Project Code', () => {
          test.beforeEach(async () => {
            await expect(newLexProjectPageMember.namePage.editProjectCodeCheckbox).toBeVisible();
            await newLexProjectPageMember.namePage.editProjectCodeCheckbox.check();
          });

          test('Can edit project code when enabled', async () => {
            await expect(newLexProjectPageMember.namePage.projectCodeInput).toBeVisible();
            await newLexProjectPageMember.namePage.projectCodeInput.fill('changed_new_project');
            await newLexProjectPageMember.namePage.projectNameInput.press('Tab'); // trigger project code check
            await expect(newLexProjectPageMember.namePage.projectCodeInput).toHaveValue('changed_new_project');
            await newLexProjectPageMember.expectFormStatusHasNoError();
          });

          test('Project code cannot be empty; does not show an error but is still invalid', async () => {
            await newLexProjectPageMember.namePage.projectCodeInput.fill('');
            await newLexProjectPageMember.namePage.projectCodeInput.press('Tab'); // trigger project code check
            await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
            await newLexProjectPageMember.expectFormStatusHasNoError();
            await expect(newLexProjectPageMember.nextButton).toBeEnabled();
            await newLexProjectPageMember.nextButton.click();
            await expect(newLexProjectPageMember.namePage.projectNameInput).toBeVisible();
            await newLexProjectPageMember.expectFormStatusHasError();
            await expect(newLexProjectPageMember.formStatus).toContainText('Project Code cannot be empty.');
          });

          test('Project code can be one character', async () => {
            await newLexProjectPageMember.namePage.editProjectCodeCheckbox.check();
            await newLexProjectPageMember.namePage.projectCodeInput.type('a');
            await newLexProjectPageMember.namePage.projectNameInput.press('Tab'); // trigger project code check
            await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeOk).toBeVisible();
            await newLexProjectPageMember.expectFormStatusHasNoError();
          });

          test('Project code cannot be uppercase', async () => {
            await newLexProjectPageMember.namePage.projectCodeInput.type('A');
            await newLexProjectPageMember.namePage.projectNameInput.press('Tab'); // trigger project code check
            await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
            await newLexProjectPageMember.expectFormStatusHasNoError();
            await newLexProjectPageMember.nextButton.click();
            await newLexProjectPageMember.expectFormStatusHasError();
            await expect(newLexProjectPageMember.formStatus).toContainText('Project Code must begin with a letter');
            await newLexProjectPageMember.namePage.projectCodeInput.type('aB');
            await newLexProjectPageMember.namePage.projectNameInput.press('Tab'); // trigger project code check
            await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
            await newLexProjectPageMember.expectFormStatusHasNoError();
            await newLexProjectPageMember.nextButton.click();
            await newLexProjectPageMember.expectFormStatusHasError();
            await expect(newLexProjectPageMember.formStatus).toContainText('Project Code must begin with a letter');
          });

          test('Project code cannot start with a number', async () => {
            await newLexProjectPageMember.namePage.projectCodeInput.type('1');
            await newLexProjectPageMember.namePage.projectNameInput.press('Tab'); // trigger project code check
            await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
            await newLexProjectPageMember.expectFormStatusHasNoError();
            await newLexProjectPageMember.nextButton.click();
            await newLexProjectPageMember.expectFormStatusHasError();
            await expect(newLexProjectPageMember.formStatus).toContainText('Project Code must begin with a letter');
          });

          test('Project code cannot use non-alphanumeric and reverts to default when Edit-project-code is disabled', async () => {
            await newLexProjectPageMember.namePage.projectCodeInput.type('a?');
            await newLexProjectPageMember.namePage.projectNameInput.press('Tab'); // trigger project code check
            await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeOk).not.toBeVisible();
            await newLexProjectPageMember.expectFormStatusHasNoError();
            await newLexProjectPageMember.nextButton.click();
            await newLexProjectPageMember.expectFormStatusHasError();
            await expect(newLexProjectPageMember.formStatus).toContainText('Project Code must begin with a letter');

            // Project code reverts to default when Edit-project-code is disabled
            await expect(newLexProjectPageMember.namePage.editProjectCodeCheckbox).toBeVisible();
            await newLexProjectPageMember.namePage.editProjectCodeCheckbox.uncheck();
            await expect(newLexProjectPageMember.namePage.projectCodeInput).not.toBeVisible();
            await expect(newLexProjectPageMember.namePage.projectCodeInput).toHaveValue(unusedProject.code);
            await newLexProjectPageMember.expectFormStatusHasNoError();
          });
        });

      });
    });

    // this test is composed of multiple tests because they all depend subsequently on one another
    // step 2: initial data & step 3: verify data
    test('Can create project, initial data page with upload & verify data', async () => {
      const newProject01 = toProject(`lexicon-new-project_spec_ts_1 - ${Date.now()}`);

      await newLexProjectPageMember.namePage.projectNameInput.type(newProject01.name);
      await newLexProjectPageMember.namePage.projectNameInput.press('Tab'); // trigger project code check
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.expectFormIsValid();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.namePage.projectNameInput).not.toBeVisible();
      await expect(newLexProjectPageMember.initialDataPageBrowseButton).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();

      // step 2: initial data
      // Initial Data page with upload
      // -- cannot see back button and defaults to uploading data
      await expect(newLexProjectPageMember.backButton).not.toBeVisible();
      await expect(newLexProjectPageMember.initialDataPageBrowseButton).toBeVisible();
      await expect(newLexProjectPageMember.progressIndicatorStep3Label).toHaveText('Verify');
      await newLexProjectPageMember.expectFormIsNotValid();
      await newLexProjectPageMember.expectFormStatusHasNoError();

      // Initial Data page with upload
      // --cannot upload large file ---------------------------------------------------
      const noticeElement = newLexProjectPageMember.noticeList;
      const [fileChooser] = await Promise.all([
        newLexProjectPageMember.page.waitForEvent('filechooser'),
        newLexProjectPageMember.initialDataPageBrowseButton.click(),
      ]);
      await expect(noticeElement.notices).toHaveCount(0);
      await fileChooser.setFiles(testFilePath('dummy_large_file.zip'));
      await expect(newLexProjectPageMember.initialDataPageBrowseButton).toBeVisible();
      await expect(newLexProjectPageMember.verifyDataPage.entriesImported).not.toBeVisible();
      await expect(noticeElement.notices).toBeVisible();
      await expect(noticeElement.notices).toHaveCount(1);
      await expect(noticeElement.notices).toContainText('is too large. It must be smaller than');
      await newLexProjectPageMember.expectFormStatusHasNoError();
      await noticeElement.closeButton.click();

      // Initial Data page with upload
      // --cannot upload jpg   --------------------------------------------------------
      const [fileChooser2] = await Promise.all([
        newLexProjectPageMember.page.waitForEvent('filechooser'),
        newLexProjectPageMember.initialDataPageBrowseButton.click(),
      ]);
      await expect(noticeElement.notices).toHaveCount(0);
      await fileChooser2.setFiles(testFilePath('FriedRiceWithPork.jpg'));
      await expect(noticeElement.notices).toBeVisible();
      await expect(noticeElement.notices).toHaveCount(1);
      await expect(noticeElement.notices).toContainText(`FriedRiceWithPork.jpg is not an allowed compressed file. Ensure the file is`);
      await expect(newLexProjectPageMember.initialDataPageBrowseButton).toBeVisible();
      await expect(newLexProjectPageMember.verifyDataPage.entriesImported).not.toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasNoError();
      await noticeElement.closeButton.click();

      // Initial Data page with upload
      // --can upload zip file  --------------------------------------------------------
      const [fileChooser3] = await Promise.all([
        newLexProjectPageMember.page.waitForEvent('filechooser'),
        newLexProjectPageMember.initialDataPageBrowseButton.click(),
      ]);
      await expect(noticeElement.notices).toHaveCount(0);
      const numberOfEntriesInTestLexProjectFile: number = 2;
      await fileChooser3.setFiles(testFilePath('TestLexProject.zip'));
      await expect(newLexProjectPageMember.verifyDataPage.entriesImported).toBeVisible();
      await expect(noticeElement.notices).toHaveCount(1);
      await expect(noticeElement.notices).toContainText(`Successfully imported TestLexProject.zip`);
      await newLexProjectPageMember.expectFormStatusHasNoError();

      // step 3: verify data
      // Verify Data await page
      // --displays stats ---------------------------------------------------------------
      await expect(newLexProjectPageMember.verifyDataPage.title).toHaveText(/Verify Data/);
      await expect(newLexProjectPageMember.verifyDataPage.entriesImported).toHaveText(numberOfEntriesInTestLexProjectFile.toString());
      await newLexProjectPageMember.expectFormStatusHasNoError();

      // Verify Data await page
      // regression avoidance test - should not redirect when button is clicked
      // --displays non-critical errors -------------------------------------------------
      // .not.tobeVisible() is the same as .toBeHidden() - fulfil the expectation even if elements does not exist
      // to check if element exists in the DOM but is not visible, do: .toHaveCount(1) .not.toBeVisible()
      await expect(newLexProjectPageMember.verifyDataPage.importErrors).toHaveCount(1);
      await expect(newLexProjectPageMember.verifyDataPage.importErrors).not.toBeVisible();
      await newLexProjectPageMember.verifyDataPage.nonCriticalErrorsButton.click();
      await expect(newLexProjectPageMember.verifyDataPage.title).toHaveText(/Verify Data/);
      await newLexProjectPageMember.expectFormStatusHasNoError();
      await expect(newLexProjectPageMember.verifyDataPage.importErrors).toBeVisible();
      await expect(newLexProjectPageMember.verifyDataPage.importErrors).toContainText('range file \'TestProj.lift-ranges\' was not found');
      await newLexProjectPageMember.verifyDataPage.nonCriticalErrorsButton.click();
      await expect(newLexProjectPageMember.verifyDataPage.importErrors).not.toBeVisible();

      // Verify Data await page
      // --can go to lexicon ------------------------------------------------------------
      await expect(newLexProjectPageMember.nextButton).toBeVisible();
      await newLexProjectPageMember.expectFormIsValid();

      const [, editorPage] = await Promise.all([
        newLexProjectPageMember.nextButton.click(),
        EditorPage.waitForNewProject(newLexProjectPageMember.page, newProject01),
      ]);
      await editorPage.entryList.expectTotalNumberOfEntries(numberOfEntriesInTestLexProjectFile);
    });

    // step 2: initial data & step 3: verify data
    test('Create: new empty project & can skip uploading data', async () => {
      const newProject02 = toProject(`lexicon-new-project_spec_ts_2 - ${Date.now()}`);

      await newLexProjectPageMember.namePage.projectNameInput.fill(newProject02.name);
      await newLexProjectPageMember.namePage.projectNameInput.press('Tab');
      await expect(newLexProjectPageMember.namePage.projectCodeExists).not.toBeVisible();
      await expect(newLexProjectPageMember.namePage.projectCodeAlphanumeric).not.toBeVisible();
      await expect(newLexProjectPageMember.namePage.projectCodeOk).toBeVisible();
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.namePage.projectNameInput).not.toBeVisible();
      await expect(newLexProjectPageMember.initialDataPageBrowseButton).toBeVisible();

      // can skip uploading data
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.expectFormIsNotValid();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.primaryLanguagePageSelectButton).toBeVisible();
    });

    // step 3 alternate: primary language
    test('Primary Language page', async () => {
      const newProject03 = toProject(`lexicon-new-project_spec_ts_3 - ${Date.now()}`);

      await newLexProjectPageMember.namePage.projectNameInput.fill(newProject03.name)
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.initialDataPageBrowseButton).toBeVisible();
      await newLexProjectPageMember.nextButton.click();

      // --Can go back to initial data page (then forward again) ----------------------
      await newLexProjectPageMember.backButton.click();
      await expect(newLexProjectPageMember.initialDataPageBrowseButton).toBeVisible();
      await newLexProjectPageMember.expectFormIsNotValid();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.primaryLanguagePageSelectButton).toBeVisible();
      await expect(newLexProjectPageMember.backButton).toBeVisible();

      // --Cannot move on if language is not selected ----------------------------------
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.expectFormIsNotValid();
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.primaryLanguagePageSelectButton).toBeVisible();
      await newLexProjectPageMember.expectFormStatusHasError();
      await expect(newLexProjectPageMember.formStatus).toContainText('Please select a primary language for the project.');

      // --Can search, select and add language ----------------------------------------
      await newLexProjectPageMember.nextButton.click();
      await expect(newLexProjectPageMember.primaryLanguagePageSelectButton).toBeEnabled();
      await newLexProjectPageMember.primaryLanguagePageSelectButton.click();
      await expect(newLexProjectPageMember.selectLanguage.searchLanguageInput).toBeVisible();
      await newLexProjectPageMember.selectLanguage.searchLanguageInput.fill('Spanish');
      await newLexProjectPageMember.selectLanguage.searchLanguageInput.press('Enter');
      await expect(newLexProjectPageMember.selectLanguage.languageRows.first()).toBeVisible();

      await expect(newLexProjectPageMember.selectLanguage.addButton).toBeVisible();
      await expect(newLexProjectPageMember.selectLanguage.addButton).not.toBeEnabled();
      await newLexProjectPageMember.selectLanguage.languageRows.first().click();
      await expect(newLexProjectPageMember.selectLanguage.addButton).toBeEnabled();
      await expect(newLexProjectPageMember.selectLanguage.addButton).toHaveText('Add español');
      await newLexProjectPageMember.selectLanguage.addButton.click();
      await expect(newLexProjectPageMember.selectLanguage.searchLanguageInput).not.toBeVisible();

      await newLexProjectPageMember.expectFormStatusHasNoError();
      await expect(newLexProjectPageMember.nextButton).toBeEnabled();
      await newLexProjectPageMember.expectFormIsValid();

      const [, editorPage] = await Promise.all([
        newLexProjectPageMember.nextButton.click(),
        EditorPage.waitForNewProject(newLexProjectPageMember.page, newProject03),
      ]);

      await expect(editorPage.noEntries).toBeVisible();
      await editorPage.entryList.createNewWordButton.click();
      await editorPage.entryList.expectTotalNumberOfEntries(1);
      await expect(editorPage.field('Word', 'es')).toBeVisible();
    });
  });
});
