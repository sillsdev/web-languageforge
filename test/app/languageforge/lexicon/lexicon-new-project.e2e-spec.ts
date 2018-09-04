import {browser, ExpectedConditions, Key} from 'protractor';

import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {Utils} from '../../bellows/shared/utils';
import {EditorPage} from './shared/editor.page';
import {NewLexProjectPage} from './shared/new-lex-project.page';

describe('Lexicon E2E New Project wizard app', async () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const util = new Utils();
  const editorPage = new EditorPage();
  const page = new NewLexProjectPage();
  const CHECK_PAUSE = 1000;

  it('admin can get to wizard', async () => {
    await loginPage.loginAsAdmin();
    await NewLexProjectPage.get();
    await expect(page.newLexProjectForm).toBeDefined();
    await expect<any>(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  it('manager can get to wizard', async () => {
    await loginPage.loginAsManager();
    await NewLexProjectPage.get();
    await expect(page.newLexProjectForm).toBeDefined();
    await expect<any>(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  it('setup: user login and page contains a form', async () => {
    await loginPage.loginAsUser();
    await NewLexProjectPage.get();
    await expect(page.newLexProjectForm).toBeDefined();
    await expect<any>(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  describe('Chooser page', async () => {

    it('cannot see Back or Next buttons', async () => {
      await expect<any>(page.backButton.isDisplayed()).toBe(false);
      await expect<any>(page.nextButton.isDisplayed()).toBe(false);
      await page.formStatus.expectHasNoError();
    });

    it('can create a new project', async () => {
      await expect<any>(page.chooserPage.createButton.isEnabled()).toBe(true);
      await page.chooserPage.createButton.click();
      await expect<any>(page.namePage.projectNameInput.isDisplayed()).toBe(true);
    });

    it('can go back to Chooser page', async () => {
      await browser.wait(ExpectedConditions.visibilityOf(page.backButton), constants.conditionTimeout);
      await expect<any>(page.backButton.isDisplayed()).toBe(true);
      await page.backButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(page.chooserPage.sendReceiveButton),
      constants.conditionTimeout);
      await expect<any>(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
    });

    it('can select Send and Receive', async () => {
      await expect<any>(page.chooserPage.sendReceiveButton.isEnabled()).toBe(true);
      await page.chooserPage.sendReceiveButton.click();
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
    });

    it('can go back to Chooser page', async () => {
      await browser.sleep(500); // added browser.sleep to avoid Timeout warnings information
      await expect<any>(page.backButton.isDisplayed()).toBe(true);
      await page.backButton.click();
      await expect<any>(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
    });

  });

  describe('Send Receive Credentials page', async () => {

    it('can get back to Send and Receive Credentials page', async () => {
      await page.chooserPage.sendReceiveButton.click();
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.loginInput.getAttribute('value')).toEqual(constants.memberUsername);
      await expect<any>(page.srCredentialsPage.passwordInput.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
    });

    it('cannot move on if Password is empty', async () => {
      await page.formStatus.expectHasNoError();
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.nextButton.click();
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      await page.formStatus.expectContainsError('Password cannot be empty.');
    });

    it('cannot move on if username is incorrect', async () => {
      // passwordInvalid is, incredibly, an invalid password.
      // It's valid only in the sense that it follows the password rules
      await page.srCredentialsPage.passwordInput.sendKeys(constants.passwordValid);
      await browser.wait(ExpectedConditions.visibilityOf(page.srCredentialsPage.credentialsInvalid),
        constants.conditionTimeout);
      await expect<any>(page.srCredentialsPage.credentialsInvalid.isDisplayed()).toBe(true);
      await page.formStatus.expectHasNoError();
      await page.nextButton.click();
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      await page.formStatus.expectContainsError('The username or password isn\'t valid on LanguageDepot.org.');
    });

    it('can go back to Chooser page, user and pass preserved', async () => {
      await expect<any>(page.backButton.isDisplayed()).toBe(true);
      await page.backButton.click();
      await expect<any>(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
      await browser.wait(ExpectedConditions.visibilityOf(page.chooserPage.sendReceiveButton),
        constants.conditionTimeout);
      await page.chooserPage.sendReceiveButton.click();
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      await expect(page.srCredentialsPage.loginInput.getAttribute('value')).toEqual(constants.memberUsername);
      await expect(page.srCredentialsPage.passwordInput.getAttribute('value')).toEqual(constants.passwordValid);
      await page.srCredentialsPage.passwordInput.clear();
    });

    it('cannot move on if Login is empty', async () => {
      await page.srCredentialsPage.loginInput.clear();
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.nextButton.click();
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      await page.formStatus.expectContainsError('Login cannot be empty.');
    });

    it('cannot move on if credentials are invalid', async () => {
      await page.srCredentialsPage.loginInput.sendKeys(constants.srUsername);
      await page.srCredentialsPage.passwordInput.sendKeys(constants.passwordValid);
      await browser.wait(ExpectedConditions.visibilityOf(page.srCredentialsPage.credentialsInvalid),
        constants.conditionTimeout);
      await expect<any>(page.srCredentialsPage.loginOk.isPresent()).toBe(false);
      await browser.wait(ExpectedConditions.visibilityOf(page.srCredentialsPage.credentialsInvalid),
        constants.conditionTimeout);
      await expect<any>(page.srCredentialsPage.credentialsInvalid.isDisplayed()).toBe(true);
      await page.formStatus.expectHasNoError();
      await page.nextButton.click();
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
    });

    it('can move on when the credentials are valid', async () => {
      await page.srCredentialsPage.passwordInput.clear();
      await page.srCredentialsPage.passwordInput.sendKeys(constants.srPassword);
      await browser.wait(ExpectedConditions.visibilityOf(page.srCredentialsPage.loginOk),
        constants.conditionTimeout);
      await expect<any>(page.srCredentialsPage.loginOk.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.passwordOk.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.projectSelect().isDisplayed()).toBe(true);
      await page.formStatus.expectHasNoError();
    });

    it('cannot move on if no project is selected', async () => {
      await page.nextButton.click();
      await expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      await expect<any>(page.srCredentialsPage.projectSelect().isDisplayed()).toBe(true);
      await page.formStatus.expectContainsError('Please select a Project.');
    });

    it('cannot move on if not a manager of the project', async () => {
      await Utils.clickDropdownByValue(page.srCredentialsPage.projectSelect(), 'mock-name2');
      await expect<any>(page.srCredentialsPage.projectNoAccess.isDisplayed()).toBe(true);
      await page.formStatus.expectContainsError('select a Project that you are the Manager of');
    });

    it('can move on when a managed project is selected', async () => {
      await Utils.clickDropdownByValue(page.srCredentialsPage.projectSelect(), 'mock-name4');
      await expect<any>(page.srCredentialsPage.projectOk.isDisplayed()).toBe(true);
      await page.formStatus.expectHasNoError();
      await page.expectFormIsValid();
    });

  });

  describe('Send Receive Verify page', async () => {

    it('can clone project', async () => {
      await browser.wait(ExpectedConditions.visibilityOf(page.nextButton), constants.conditionTimeout);
      await page.nextButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(page.srClonePage.cloning), constants.conditionTimeout);
      await expect<any>(page.srClonePage.cloning.isDisplayed()).toBe(true);
    });

    it('cannot move on while cloning', async () => {
      await expect<any>(page.nextButton.isDisplayed()).toBe(false);
      await expect<any>(page.nextButton.isEnabled()).toBe(false);
      await page.expectFormIsNotValid();
    });

  });

  describe('New Project Name page', async () => {

    it('can create a new project', async () => {
      await NewLexProjectPage.get();
      await page.chooserPage.createButton.click();
      await expect<any>(page.namePage.projectNameInput.isPresent()).toBe(true);
    });

    it('cannot move on if name is invalid', async () => {
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.nextButton.click();
      await expect<any>(page.namePage.projectNameInput.isPresent()).toBe(true);
      await page.formStatus.expectContainsError('Project Name cannot be empty.');
    });

    it('finds the test project already exists', async () => {
      await page.namePage.projectNameInput.sendKeys(constants.testProjectName + Key.TAB);
      await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeExists), constants.conditionTimeout);
      await expect<any>(page.namePage.projectCodeExists.isDisplayed()).toBe(true);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      await expect(page.namePage.projectCodeInput.getAttribute('value')).toEqual(constants.testProjectCode);
      await page.formStatus.expectContainsError('Another project with code \'' + constants.testProjectCode +
        '\' already exists.');
    });

    it('with a cleared name does not show an error but is still invalid', async () => {

      /**
       * FIXME: added the following two lines so the test will work (previous error wasn't clearing)
       * as I couldn't re-produce the problem manually,
       * however is likely symptomatic of some funkiness with promises. IJH 2014-12
       */

      await page.namePage.projectNameInput.sendKeys('a' + Key.TAB);
      await page.namePage.projectNameInput.clear();
      await page.namePage.projectNameInput.sendKeys(Key.TAB);
      await browser.sleep(CHECK_PAUSE);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      await page.formStatus.expectHasNoError();
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.nextButton.click();
      await expect<any>(page.namePage.projectNameInput.isPresent()).toBe(true);
      await page.formStatus.expectContainsError('Project Name cannot be empty.');
    });

    it('can verify that an unused project name is available', async () => {
      await page.namePage.projectNameInput.sendKeys(constants.newProjectName + Key.TAB);
      await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeOk),
        constants.conditionTimeout);
      await expect<any>(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeInput.getAttribute('value')).toEqual(constants.newProjectCode);
      await page.formStatus.expectHasNoError();
    });

    it('can not edit project code by default', async () => {
      await expect<any>(page.namePage.projectCodeInput.isDisplayed()).toBe(false);
    });

    it('can edit project code when enabled', async () => {
      await expect<any>(page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
      await util.setCheckbox(page.namePage.editProjectCodeCheckbox, true);
      await expect<any>(page.namePage.projectCodeInput.isDisplayed()).toBe(true);
      await page.namePage.projectCodeInput.clear();
      await page.namePage.projectCodeInput.sendKeys('changed_new_project');
      await page.namePage.projectNameInput.sendKeys(Key.TAB);     // trigger project code check
      await expect<any>(page.namePage.projectCodeInput.getAttribute('value')).toEqual('changed_new_project');
      await page.formStatus.expectHasNoError();
    });

    it('project code cannot be empty; does not show an error but is still invalid', async () => {
      await page.namePage.projectCodeInput.clear();
      await page.namePage.projectNameInput.sendKeys(Key.TAB);     // trigger project code check
      await browser.sleep(CHECK_PAUSE);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      await page.formStatus.expectHasNoError();
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.nextButton.click();
      await expect<any>(page.namePage.projectNameInput.isPresent()).toBe(true);
      await page.formStatus.expectContainsError('Project Code cannot be empty.');
    });

    it('project code can be one character', async () => {
      await page.namePage.projectCodeInput.clear();
      await page.namePage.projectCodeInput.sendKeys('a');
      await page.namePage.projectNameInput.sendKeys(Key.TAB);     // trigger project code check
      await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeOk), constants.conditionTimeout);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      await page.formStatus.expectHasNoError();
    });

    it('project code cannot be uppercase', async () => {
      await page.namePage.projectCodeInput.clear();
      await page.namePage.projectCodeInput.sendKeys('A' + Key.TAB);
      await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric),
        constants.conditionTimeout);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      await expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      await page.formStatus.expectHasNoError();
      await page.nextButton.click();
      await page.formStatus.expectContainsError('Project Code must begin with a letter');
      await page.namePage.projectCodeInput.clear();
      await page.namePage.projectCodeInput.sendKeys('aB' + Key.TAB);
      await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric),
        constants.conditionTimeout);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      await expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      await page.formStatus.expectHasNoError();
      await page.nextButton.click();
      await page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code cannot start with a number', async () => {
      await page.namePage.projectCodeInput.clear();
      await page.namePage.projectCodeInput.sendKeys('1' + Key.TAB);
      await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric),
        constants.conditionTimeout);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      await expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      await page.formStatus.expectHasNoError();
      await page.nextButton.click();
      await page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code cannot use non-alphanumeric', async () => {
      await page.namePage.projectCodeInput.clear();
      await page.namePage.projectCodeInput.sendKeys('a?' + Key.TAB);
      await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric),
        constants.conditionTimeout);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      await expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      await page.formStatus.expectHasNoError();
      await page.nextButton.click();
      await page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code reverts to default when Edit-project-code is disabled', async () => {
      await expect<any>(page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
      await util.setCheckbox(page.namePage.editProjectCodeCheckbox, false);
      await expect<any>(page.namePage.projectCodeInput.isDisplayed()).toBe(false);
      await expect(page.namePage.projectCodeInput.getAttribute('value')).toEqual(constants.newProjectCode);
      await page.formStatus.expectHasNoError();
    });

    it('can create project', async () => {
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.expectFormIsValid();
      await page.nextButton.click();
      await expect<any>(page.namePage.projectNameInput.isPresent()).toBe(false);
      await expect<any>(page.initialDataPage.browseButton.isPresent()).toBe(true);
      await page.formStatus.expectHasNoError();
    });

  });

  describe('Initial Data page with upload', async () => {

    it('cannot see back button and defaults to uploading data', async () => {
      await expect<any>(page.backButton.isDisplayed()).toBe(false);
      await expect<any>(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
      await expect<any>(page.progressIndicatorStep3Label.getText()).toEqual('Verify');
      await page.expectFormIsNotValid();
      await page.formStatus.expectHasNoError();
    });

    describe('Mock file upload', async () => {

      it('cannot upload large file', async () => {
        await page.initialDataPage.mockUpload.enableButton.click();
        await expect<any>(page.initialDataPage.mockUpload.fileNameInput.isPresent()).toBe(true);
        await expect<any>(page.initialDataPage.mockUpload.fileNameInput.isDisplayed()).toBe(true);
        await page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockZipImportFile.name);
        await page.initialDataPage.mockUpload.fileSizeInput.sendKeys(134217728);
        await expect<any>(page.noticeList.count()).toBe(0);
        await page.initialDataPage.mockUpload.uploadButton.click();
        await expect<any>(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        await expect<any>(page.verifyDataPage.entriesImported.isPresent()).toBe(false);
        await expect<any>(page.noticeList.count()).toBe(1);
        await expect<any>(page.noticeList.get(0).getText()).toContain('is too large. It must be smaller than');
        await page.formStatus.expectHasNoError();
        await page.initialDataPage.mockUpload.fileNameInput.clear();
        await page.initialDataPage.mockUpload.fileSizeInput.clear();
        await page.firstNoticeCloseButton.click();
      });

      it('cannot upload jpg', async () => {
        await page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockJpgImportFile.name);
        await page.initialDataPage.mockUpload.fileSizeInput.sendKeys(constants.testMockJpgImportFile.size);
        await expect<any>(page.noticeList.count()).toBe(0);
        await page.initialDataPage.mockUpload.uploadButton.click();
        await expect<any>(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        await expect<any>(page.verifyDataPage.entriesImported.isPresent()).toBe(false);
        await expect<any>(page.noticeList.count()).toBe(1);
        await expect(page.noticeList.get(0).getText()).toContain(constants.testMockJpgImportFile.name +
          ' is not an allowed compressed file. Ensure the file is');
        await page.formStatus.expectHasNoError();
        await page.initialDataPage.mockUpload.fileNameInput.clear();
        await page.initialDataPage.mockUpload.fileSizeInput.clear();
        await page.firstNoticeCloseButton.click();
      });

      it('can upload zip file', async () => {
        await page.initialDataPage.mockUpload.fileNameInput.sendKeys(constants.testMockZipImportFile.name);
        await page.initialDataPage.mockUpload.fileSizeInput.sendKeys(constants.testMockZipImportFile.size);
        await expect<any>(page.noticeList.count()).toBe(0);
        await page.initialDataPage.mockUpload.uploadButton.click();
        await expect<any>(page.verifyDataPage.entriesImported.isDisplayed()).toBe(true);
        await expect<any>(page.noticeList.count()).toBe(1);
        await expect(page.noticeList.get(0).getText()).toContain('Successfully imported ' +
          constants.testMockZipImportFile.name);
        await page.formStatus.expectHasNoError();
      });

    });

  });

  describe('Verify Data page', async () => {

    it('displays stats', async () => {
      await expect<any>(page.verifyDataPage.title.getText()).toEqual('Verify Data');
      await expect<any>(page.verifyDataPage.entriesImported.getText()).toEqual('2');
      await page.formStatus.expectHasNoError();
    });

    // regression avoidance test - should not redirect when button is clicked
    it('displays non-critical errors', async () => {
      await expect<any>(page.verifyDataPage.importErrors.isPresent()).toBe(true);
      await expect<any>(page.verifyDataPage.importErrors.isDisplayed()).toBe(false);
      await page.verifyDataPage.nonCriticalErrorsButton.click();
      await expect<any>(page.verifyDataPage.title.getText()).toEqual('Verify Data');
      await page.formStatus.expectHasNoError();
      await expect<any>(page.verifyDataPage.importErrors.isDisplayed()).toBe(true);
      await expect(page.verifyDataPage.importErrors.getText())
        .toContain('range file \'TestProj.lift-ranges\' was not found');
      await page.verifyDataPage.nonCriticalErrorsButton.click();
      await browser.wait(ExpectedConditions.invisibilityOf(page.verifyDataPage.importErrors),
        constants.conditionTimeout);
      await expect<any>(page.verifyDataPage.importErrors.isDisplayed()).toBe(false);
    });

    it('can go to lexicon', async () => {
      await expect<any>(page.nextButton.isDisplayed()).toBe(true);
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.expectFormIsValid();
      await page.nextButton.click();
      await browser.sleep(CHECK_PAUSE);
      await expect<any>(editorPage.browse.getEntryCount()).toBe(2);
      await browser.sleep(CHECK_PAUSE);
    });

  });

  describe('New Empty Project Name page', async () => {

    it('create: new empty project', async () => {
      await NewLexProjectPage.get();
      await page.chooserPage.createButton.click();
      await page.namePage.projectNameInput.sendKeys(constants.emptyProjectName + Key.TAB);
      await browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeOk), constants.conditionTimeout);
      await expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      await expect<any>(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      await expect<any>(page.nextButton.isEnabled()).toBe(true);

      // added sleep to ensure state is stable so the next test passes (expectFormIsNotValid)
      await browser.sleep(500);
      await page.nextButton.click();
      await expect<any>(page.namePage.projectNameInput.isPresent()).toBe(false);
      await expect<any>(page.initialDataPage.browseButton.isPresent()).toBe(true);
    });

  });

  describe('Initial Data page skipping upload', async () => {

    it('can skip uploading data', async () => {
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.expectFormIsNotValid();
      await page.nextButton.click();
      await expect<any>(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
    });

  });

  describe('Primary Language page', async () => {

    it('can go back to initial data page (then forward again)', async () => {
      await expect<any>(page.backButton.isDisplayed()).toBe(true);
      await expect<any>(page.backButton.isEnabled()).toBe(true);
      await page.backButton.click();
      await expect<any>(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.expectFormIsNotValid();
      await page.nextButton.click();
      await expect<any>(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
      await expect<any>(page.backButton.isDisplayed()).toBe(true);
    });

    it('cannot move on if language is not selected', async () => {
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.expectFormIsNotValid();
      await page.nextButton.click();
      await expect<any>(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
      await page.formStatus.expectContainsError('Please select a primary language for the project.');
    });

    it('can select language', async () => {
      await expect<any>(page.primaryLanguagePage.selectButton.isEnabled()).toBe(true);
      await page.primaryLanguagePage.selectButtonClick();
      await expect<any>(page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
    });

    describe('Select Language modal', async () => {

      it('can search, select and add language', async () => {
        await page.modal.selectLanguage.searchLanguageInput.sendKeys(constants.searchLanguage + Key.ENTER);
        await expect<any>(page.modal.selectLanguage.languageRows.first().isPresent()).toBe(true);

        await expect<any>(page.modal.selectLanguage.addButton.isPresent()).toBe(true);
        await expect<any>(page.modal.selectLanguage.addButton.isEnabled()).toBe(false);
        await page.modal.selectLanguage.languageRows.first().click();
        await expect<any>(page.modal.selectLanguage.addButton.isEnabled()).toBe(true);
        await expect<any>(page.modal.selectLanguage.addButton.getText()).toEqual('Add ' + constants.foundLanguage);

        await page.modal.selectLanguage.addButton.click();
        await browser.wait(ExpectedConditions.stalenessOf(page.modal.selectLanguage.searchLanguageInput),
          constants.conditionTimeout);
        await expect<any>(page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
      });

    });

    it('can go to lexicon and primary language has changed', async () => {
      await page.formStatus.expectHasNoError();
      await expect<any>(page.nextButton.isEnabled()).toBe(true);
      await page.expectFormIsValid();
      await page.nextButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(editorPage.browse.noEntriesElem), constants.conditionTimeout);
      await expect<any>(editorPage.browse.noEntriesElem.isDisplayed()).toBe(true);
      await editorPage.browse.noEntriesNewWordBtn.click();
      await browser.sleep(500); // added browser.sleep to avoid Timeout warnings information
      // await browser.wait(() => editorPage.edit.getEntryCount(), constants.conditionTimeout);
      await expect<any>(editorPage.edit.getEntryCount()).toBe(1);
      await browser.sleep(500); // added browser.sleep to avoid Timeout warnings information
      // await browser.wait(() => editorPage.edit.getLexemesAsObject(), constants.conditionTimeout);
      await expect<any>(editorPage.edit.getLexemesAsObject()).toEqual({ es: '' });
    });

  });

});
