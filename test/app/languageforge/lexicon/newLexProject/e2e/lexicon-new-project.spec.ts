
import { browser, ExpectedConditions, Key } from 'protractor';
import { BellowsLoginPage } from '../../../../bellows/pages/loginPage';
import { Utils } from '../../../../bellows/pages/utils';
import { EditorPage } from '../../pages/editorPage';
import { NewLexProjectPage } from '../../pages/newLexProjectPage';

const constants   = require('../../../../testConstants.json');
const loginPage   = new BellowsLoginPage();
const util        = new Utils();
const editorPage  = new EditorPage();
const page        = new NewLexProjectPage();
const CONDITION_TIMEOUT = 3000;
const CHECK_PAUSE = 1000;

describe('E2E testing: New Lex Project wizard app', () => {
  it('admin can get to wizard', () => {
    loginPage.loginAsAdmin();
    page.get();
    expect(page.newLexProjectForm).toBeDefined();
    expect<any>(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  it('manager can get to wizard', () => {
    loginPage.loginAsManager();
    page.get();
    expect(page.newLexProjectForm).toBeDefined();
    expect<any>(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  it('setup: user login and page contains a form', () => {
    loginPage.loginAsUser();
    page.get();
    expect(page.newLexProjectForm).toBeDefined();
    expect<any>(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  describe('Chooser page', () => {

    it('cannot see Back or Next buttons', () => {
      expect<any>(page.backButton.isDisplayed()).toBe(false);
      expect<any>(page.nextButton.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
    });

    it('can create a new project', () => {
      expect<any>(page.chooserPage.createButton.isEnabled()).toBe(true);
      page.chooserPage.createButton.click();
      expect<any>(page.namePage.projectNameInput.isDisplayed()).toBe(true);
    });

    it('can go back to Chooser page', () => {
      expect<any>(page.backButton.isDisplayed()).toBe(true);
      page.backButton.click();
      expect<any>(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
    });

    it('can select Send and Receive', () => {
      expect<any>(page.chooserPage.sendReceiveButton.isEnabled()).toBe(true);
      page.chooserPage.sendReceiveButton.click();
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
    });

    it('can go back to Chooser page', () => {
      expect<any>(page.backButton.isDisplayed()).toBe(true);
      page.backButton.click();
      expect<any>(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
    });

  });

  describe('Send Receive Credentials page', () => {

    it('can get back to Send and Receive Credentials page', () => {
      page.chooserPage.sendReceiveButton.click();
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.loginInput.getAttribute('value'))
        .toEqual(constants.memberUsername);
      expect<any>(page.srCredentialsPage.passwordInput.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
    });

    it('cannot move on if Password is empty', () => {
      page.formStatus.expectHasNoError();
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      page.formStatus.expectContainsError('Password cannot be empty.');
    });

    it('cannot move on if username is incorrect', () => {
      // passwordInvalid is, incredibly, an invalid password.
      // It's valid only in the sense that it follows the password rules
      page.srCredentialsPage.passwordInput.sendKeys(constants.passwordValid);
      browser.wait(ExpectedConditions.visibilityOf(page.srCredentialsPage.credentialsInvalid),
        CONDITION_TIMEOUT);
      expect<any>(page.srCredentialsPage.credentialsInvalid.isDisplayed()).toBe(true);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      page.formStatus.expectContainsError(
        'The username or password isn\'t valid on LanguageDepot.org.');
    });

    it('can go back to Chooser page, user and pass preserved', () => {
      expect<any>(page.backButton.isDisplayed()).toBe(true);
      page.backButton.click();
      expect<any>(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
      page.chooserPage.sendReceiveButton.click();
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.loginInput.getAttribute('value'))
        .toEqual(constants.memberUsername);
      expect(page.srCredentialsPage.passwordInput.getAttribute('value'))
        .toEqual(constants.passwordValid);
      page.srCredentialsPage.passwordInput.clear();
    });

    it('cannot move on if Login is empty', () => {
      page.srCredentialsPage.loginInput.clear();
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      page.formStatus.expectContainsError('Login cannot be empty.');
    });

    it('cannot move on if credentials are invalid', () => {
      page.srCredentialsPage.loginInput.sendKeys(constants.srUsername);
      page.srCredentialsPage.passwordInput.sendKeys(constants.passwordValid);
      browser.wait(ExpectedConditions.visibilityOf(page.srCredentialsPage.credentialsInvalid),
        CONDITION_TIMEOUT);
      expect<any>(page.srCredentialsPage.loginOk.isPresent()).toBe(false);
      expect<any>(page.srCredentialsPage.credentialsInvalid.isDisplayed()).toBe(true); // flaky assertion
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
    });

    it('can move on when the credentials are valid', () => {
      page.srCredentialsPage.passwordInput.clear();
      page.srCredentialsPage.passwordInput.sendKeys(constants.srPassword);
      browser.wait(ExpectedConditions.visibilityOf(page.srCredentialsPage.passwordOk),
        CONDITION_TIMEOUT);
      expect<any>(page.srCredentialsPage.loginOk.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.passwordOk.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.projectSelect().isDisplayed()).toBe(true);
      page.formStatus.expectHasNoError();
    });

    it('cannot move on if no project is selected', () => {
      page.nextButton.click();
      expect<any>(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect<any>(page.srCredentialsPage.projectSelect().isDisplayed()).toBe(true);
      page.formStatus.expectContainsError('Please select a Project.');
    });

    it('cannot move on if not a manager of the project', () => {
      util.clickDropdownByValue(page.srCredentialsPage.projectSelect(), 'mock-name2');
      expect<any>(page.srCredentialsPage.projectNoAccess.isDisplayed()).toBe(true);
      page.formStatus.expectContainsError('select a Project that you are the Manager of');
    });

    it('can move on when a managed project is selected', () => {
      util.clickDropdownByValue(page.srCredentialsPage.projectSelect(), 'mock-name4');
      expect<any>(page.srCredentialsPage.projectOk.isDisplayed()).toBe(true);
      page.formStatus.expectHasNoError();
      page.expectFormIsValid();
    });

  });

  describe('Send Receive Verify page', () => {
    var CONDITION_TIMEOUT = 5000;

    it('can clone project', () => {
      page.nextButton.click();
      browser.wait(ExpectedConditions.visibilityOf(page.srClonePage.cloning), CONDITION_TIMEOUT);
      expect<any>(page.srClonePage.cloning.isDisplayed()).toBe(true);
    });

    it('cannot move on while cloning', () => {
      expect<any>(page.nextButton.isDisplayed()).toBe(false);
      expect<any>(page.nextButton.isEnabled()).toBe(false);
      page.expectFormIsNotValid();
    });

  });

  describe('New Project Name page', () => {

    it('can create a new project', () => {
      page.get();
      page.chooserPage.createButton.click();
      expect<any>(page.namePage.projectNameInput.isPresent()).toBe(true);
    });

    it('cannot move on if name is invalid', () => {
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect<any>(page.namePage.projectNameInput.isPresent()).toBe(true);
      page.formStatus.expectContainsError('Project Name cannot be empty.');
    });

    it('finds the test project already exists', () => {
      page.namePage.projectNameInput.sendKeys(constants.testProjectName + Key.TAB);
      browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeExists),
        CONDITION_TIMEOUT);
      expect<any>(page.namePage.projectCodeExists.isDisplayed()).toBe(true);
      expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      expect(page.namePage.projectCodeInput.getAttribute('value'))
        .toEqual(constants.testProjectCode);
      page.formStatus.expectContainsError('Another project with code \'' +
        constants.testProjectCode + '\' already exists.');
    });

    it('with a cleared name does not show an error but is still invalid', () => {

      /**
       * FIXME: added the following two lines so the test will work (previous error wasn't clearing)
       * as I couldn't re-produce the problem manually,
       * however is likely symptomatic of some funkiness with promises. IJH 2014-12
       **/
      page.namePage.projectNameInput.sendKeys('a' + Key.TAB);
      page.namePage.projectNameInput.clear();
      page.namePage.projectNameInput.sendKeys(Key.TAB);
      browser.sleep(CHECK_PAUSE);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      page.formStatus.expectHasNoError();
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect<any>(page.namePage.projectNameInput.isPresent()).toBe(true);
      page.formStatus.expectContainsError('Project Name cannot be empty.');
    });

    it('can verify that an unused project name is available', () => {
      page.namePage.projectNameInput.sendKeys(constants.newProjectName + Key.TAB);
      browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeOk),
        CONDITION_TIMEOUT);
      expect<any>(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeInput.getAttribute('value')).toEqual(constants.newProjectCode);
      page.formStatus.expectHasNoError();
    });

    it('can not edit project code by default', () => {
      expect<any>(page.namePage.projectCodeInput.isDisplayed()).toBe(false);
    });

    it('can edit project code when enabled', () => {
      expect<any>(page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
      util.setCheckbox(page.namePage.editProjectCodeCheckbox, true);
      expect<any>(page.namePage.projectCodeInput.isDisplayed()).toBe(true);
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('changed_new_project');
      page.namePage.projectNameInput.sendKeys(Key.TAB);     // trigger project code check
      expect<any>(page.namePage.projectCodeInput.getAttribute('value')).toEqual('changed_new_project');
      page.formStatus.expectHasNoError();
    });

    it('project code cannot be empty; does not show an error but is still invalid', () => {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectNameInput.sendKeys(Key.TAB);     // trigger project code check
      browser.sleep(CHECK_PAUSE);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      page.formStatus.expectHasNoError();
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect<any>(page.namePage.projectNameInput.isPresent()).toBe(true);
      page.formStatus.expectContainsError('Project Code cannot be empty.');
    });

    it('project code can be one character', () => {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('a');
      page.namePage.projectNameInput.sendKeys(Key.TAB);     // trigger project code check
      browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeOk), CONDITION_TIMEOUT);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      page.formStatus.expectHasNoError();
    });

    it('project code cannot be uppercase', () => {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('A' + Key.TAB);
      browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric),
        CONDITION_TIMEOUT);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      page.formStatus.expectContainsError('Project Code must begin with a letter');
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('aB' + Key.TAB);
      browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric),
        CONDITION_TIMEOUT);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code cannot start with a number', () => {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('1' + Key.TAB);
      browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric),
        CONDITION_TIMEOUT);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code cannot use non-alphanumeric', () => {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('a?' + Key.TAB);
      browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeAlphanumeric),
        CONDITION_TIMEOUT);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect<any>(page.namePage.projectCodeOk.isPresent()).toBe(false);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code reverts to default when Edit-project-code is disabled', () => {
      expect<any>(page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
      util.setCheckbox(page.namePage.editProjectCodeCheckbox, false);
      expect<any>(page.namePage.projectCodeInput.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeInput.getAttribute('value'))
        .toEqual(constants.newProjectCode);
      page.formStatus.expectHasNoError();
    });

    it('can create project', () => {
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsValid();
      page.nextButton.click();
      expect<any>(page.namePage.projectNameInput.isPresent()).toBe(false);
      expect<any>(page.initialDataPage.browseButton.isPresent()).toBe(true);
      page.formStatus.expectHasNoError();
    });

  });

  describe('Initial Data page with upload', () => {

    it('cannot see back button and defaults to uploading data', () => {
      expect<any>(page.backButton.isDisplayed()).toBe(false);
      expect<any>(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
      expect<any>(page.progressIndicatorStep3Label.getText()).toEqual('Verify');
      page.expectFormIsNotValid();
      page.formStatus.expectHasNoError();
    });

    describe('Mock file upload', () => {

      it('cannot upload large file', () => {
        page.initialDataPage.mockUpload.enableButton.click();
        expect<any>(page.initialDataPage.mockUpload.fileNameInput.isPresent()).toBe(true);
        expect<any>(page.initialDataPage.mockUpload.fileNameInput.isDisplayed()).toBe(true);
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(
          constants.testMockZipImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(134217728);
        expect<any>(page.noticeList.count()).toBe(0);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect<any>(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        expect<any>(page.verifyDataPage.entriesImported.isPresent()).toBe(false);
        expect<any>(page.noticeList.count()).toBe(1);
        expect<any>(page.noticeList.get(0).getText()).toContain('is too large. It must be smaller than');
        page.formStatus.expectHasNoError();
        page.initialDataPage.mockUpload.fileNameInput.clear();
        page.initialDataPage.mockUpload.fileSizeInput.clear();
        page.firstNoticeCloseButton.click();
      });

      it('cannot upload jpg', () => {
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(
          constants.testMockJpgImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(
          constants.testMockJpgImportFile.size);
        expect<any>(page.noticeList.count()).toBe(0);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect<any>(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        expect<any>(page.verifyDataPage.entriesImported.isPresent()).toBe(false);
        expect<any>(page.noticeList.count()).toBe(1);
        expect(page.noticeList.get(0).getText()).toContain(constants.testMockJpgImportFile.name +
          ' is not an allowed compressed file. Ensure the file is');
        page.formStatus.expectHasNoError();
        page.initialDataPage.mockUpload.fileNameInput.clear();
        page.initialDataPage.mockUpload.fileSizeInput.clear();
        page.firstNoticeCloseButton.click();
      });

      it('can upload zip file', () => {
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(
          constants.testMockZipImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(
          constants.testMockZipImportFile.size);
        expect<any>(page.noticeList.count()).toBe(0);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect<any>(page.verifyDataPage.entriesImported.isDisplayed()).toBe(true);
        expect<any>(page.noticeList.count()).toBe(1);
        expect(page.noticeList.get(0).getText()).toContain('Successfully imported ' +
          constants.testMockZipImportFile.name);
        page.formStatus.expectHasNoError();
      });

    });

  });

  describe('Verify Data page', () => {

    it('displays stats', () => {
      expect<any>(page.verifyDataPage.title.getText()).toEqual('Verify Data');
      expect<any>(page.verifyDataPage.entriesImported.getText()).toEqual('2');
      page.formStatus.expectHasNoError();
    });

    // regression avoidance test - should not redirect when button is clicked
    it('displays non-critical errors', () => {
      expect<any>(page.verifyDataPage.importErrors.isPresent()).toBe(true);
      expect<any>(page.verifyDataPage.importErrors.isDisplayed()).toBe(false);
      page.verifyDataPage.nonCriticalErrorsButton.click();
      expect<any>(page.verifyDataPage.title.getText()).toEqual('Verify Data');
      page.formStatus.expectHasNoError();
      expect<any>(page.verifyDataPage.importErrors.isDisplayed()).toBe(true);
      expect(page.verifyDataPage.importErrors.getText())
        .toContain('range file \'TestProj.lift-ranges\' was not found');
      page.verifyDataPage.nonCriticalErrorsButton.click();
      browser.wait(ExpectedConditions.invisibilityOf(page.verifyDataPage.importErrors),
        CONDITION_TIMEOUT);
      expect<any>(page.verifyDataPage.importErrors.isDisplayed()).toBe(false);
    });

    it('can go to lexicon', () => {
      expect<any>(page.nextButton.isDisplayed()).toBe(true);
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsValid();
      page.nextButton.click();
      expect<any>(editorPage.browse.getEntryCount()).toBe(2);
    });

  });

  describe('New Empty Project Name page', () => {

    it('create: new empty project', () => {
      page.get();
      page.chooserPage.createButton.click();
      page.namePage.projectNameInput.sendKeys(constants.emptyProjectName + Key.TAB);
      browser.wait(ExpectedConditions.visibilityOf(page.namePage.projectCodeOk), CONDITION_TIMEOUT);
      expect<any>(page.namePage.projectCodeExists.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeAlphanumeric.isPresent()).toBe(false);
      expect<any>(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      expect<any>(page.nextButton.isEnabled()).toBe(true);

      // added sleep to ensure state is stable so the next test passes (expectFormIsNotValid)
      browser.sleep(500);
      page.nextButton.click();
      expect<any>(page.namePage.projectNameInput.isPresent()).toBe(false);
      expect<any>(page.initialDataPage.browseButton.isPresent()).toBe(true);
    });

  });

  describe('Initial Data page skipping upload', () => {

    it('can skip uploading data', () => {
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsNotValid();
      page.nextButton.click();
      expect<any>(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
    });

  });

  describe('Primary Language page', () => {

    it('can go back to initial data page (then forward again)', () => {
      expect<any>(page.backButton.isDisplayed()).toBe(true);
      expect<any>(page.backButton.isEnabled()).toBe(true);
      page.backButton.click();
      expect<any>(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsNotValid();
      page.nextButton.click();
      expect<any>(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
      expect<any>(page.backButton.isDisplayed()).toBe(true);
    });

    it('cannot move on if language is not selected', () => {
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsNotValid();
      page.nextButton.click();
      expect<any>(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
      page.formStatus.expectContainsError('Please select a primary language for the project.');
    });

    it('can select language', () => {
      expect<any>(page.primaryLanguagePage.selectButton.isEnabled()).toBe(true);
      page.primaryLanguagePage.selectButtonClick();
      expect<any>(page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
    });

    describe('Select Language modal', () => {

      it('can search, select and add language', () => {
        page.modal.selectLanguage.searchLanguageInput.sendKeys(
          constants.searchLanguage + Key.ENTER);
        expect<any>(page.modal.selectLanguage.languageRows.first().isPresent()).toBe(true);

        expect<any>(page.modal.selectLanguage.addButton.isPresent()).toBe(true);
        expect<any>(page.modal.selectLanguage.addButton.isEnabled()).toBe(false);
        page.modal.selectLanguage.languageRows.first().click();
        expect<any>(page.modal.selectLanguage.addButton.isEnabled()).toBe(true);
        expect<any>(page.modal.selectLanguage.addButton.getText()).toEqual(
          'Add ' + constants.foundLanguage);

        page.modal.selectLanguage.addButton.click();
        browser.wait(ExpectedConditions.stalenessOf(page.modal.selectLanguage.searchLanguageInput),
          CONDITION_TIMEOUT);
        expect<any>(page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
      });

    });

    it('can go to lexicon and primary language has changed', () => {
      page.formStatus.expectHasNoError();
      expect<any>(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsValid();
      page.nextButton.click();
      browser.wait(ExpectedConditions.visibilityOf(editorPage.browse.noEntriesElem),
        CONDITION_TIMEOUT);
      expect<any>(editorPage.browse.noEntriesElem.isDisplayed()).toBe(true);
      editorPage.browse.noEntriesNewWordBtn.click();
      expect<any>(editorPage.edit.getEntryCount()).toBe(1);
      expect<any>(editorPage.edit.getLexemesAsObject()).toEqual({ es: '' });
    });

  });

});
