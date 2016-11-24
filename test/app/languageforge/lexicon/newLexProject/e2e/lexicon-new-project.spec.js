'use strict';

describe('E2E testing: New Lex Project wizard app', function () {
  var constants = require('../../../../testConstants.json');
  var loginPage = require('../../../../bellows/pages/loginPage.js');
  var util      = require('../../../../bellows/pages/util.js');
  var editorPage = require('../../pages/editorPage.js');
  var page       = require('../../pages/newLexProjectPage.js');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;
  var CHECK_PAUSE = 1000;

  it('admin can get to each wizard', function () {
    loginPage.loginAsAdmin();
    page.get();
    expect(page.newLexProjectForm).toBeDefined();
    expect(page.namePage.projectNameInput.isDisplayed()).toBe(true);
    page.getChooser();
    expect(page.newLexProjectForm).toBeDefined();
    expect(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  it('manager can get to each wizard', function () {
    loginPage.loginAsManager();
    page.get();
    expect(page.newLexProjectForm).toBeDefined();
    expect(page.namePage.projectNameInput.isDisplayed()).toBe(true);
    page.getChooser();
    expect(page.newLexProjectForm).toBeDefined();
    expect(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  it('setup: user login and page contains a form', function () {
    loginPage.loginAsUser();
    page.get();
    expect(page.newLexProjectForm).toBeDefined();
    expect(page.namePage.projectNameInput.isDisplayed()).toBe(true);
    page.getChooser();
    expect(page.newLexProjectForm).toBeDefined();
    expect(page.chooserPage.createButton.isDisplayed()).toBe(true);
  });

  describe('Chooser page', function () {

    it('cannot see Back or Next buttons', function () {
      expect(page.backButton.isDisplayed()).toBe(false);
      expect(page.nextButton.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
    });

    it('can create a new project', function () {
      expect(page.chooserPage.createButton.isEnabled()).toBe(true);
      page.chooserPage.createButton.click();
      expect(page.namePage.projectNameInput.isDisplayed()).toBe(true);
    });

    it('can go back to Chooser page', function () {
      expect(page.backButton.isDisplayed()).toBe(true);
      page.backButton.click();
      expect(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
    });

    it('can select Send and Receive', function () {
      expect(page.chooserPage.sendReceiveButton.isEnabled()).toBe(true);
      page.chooserPage.sendReceiveButton.click();
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
    });

    it('can go back to Chooser page', function () {
      expect(page.backButton.isDisplayed()).toBe(true);
      page.backButton.click();
      expect(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
    });

  });

  describe('Send Receive Credentials page', function () {

    it('can get back to Send and Receive Credentials page', function () {
      page.chooserPage.sendReceiveButton.click();
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.loginInput.getAttribute('value'))
        .toEqual(constants.memberUsername);
      expect(page.srCredentialsPage.passwordInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      expect(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
    });

    it('cannot move on if Password is empty', function () {
      page.formStatus.expectHasNoError();
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      expect(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      page.formStatus.expectContainsError('Password cannot be empty.');
    });

    it('cannot move on if Login doesn\'t exist', function () {
      page.srCredentialsPage.passwordInput.sendKeys(constants.passwordValid);
      browser.wait(expectedCondition.visibilityOf(page.srCredentialsPage.loginUnknown),
        CONDITION_TIMEOUT);
      expect(page.srCredentialsPage.loginUnknown.isDisplayed()).toBe(true);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      expect(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      page.formStatus.expectContainsError('The Login dosen\'t exist on LanguageDepot.org.');
    });

    it('can go back to Chooser page, user and pass preserved', function () {
      expect(page.backButton.isDisplayed()).toBe(true);
      page.backButton.click();
      expect(page.chooserPage.sendReceiveButton.isDisplayed()).toBe(true);
      page.chooserPage.sendReceiveButton.click();
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.loginInput.getAttribute('value'))
        .toEqual(constants.memberUsername);
      expect(page.srCredentialsPage.passwordInput.getAttribute('value'))
        .toEqual(constants.passwordValid);
      page.srCredentialsPage.passwordInput.clear();
    });

    it('cannot move on if Login is empty', function () {
      page.srCredentialsPage.loginInput.clear();
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      expect(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      page.formStatus.expectContainsError('Login cannot be empty.');
    });

    it('can find an existing Login', function () {
      page.srCredentialsPage.loginInput.sendKeys(constants.srUsername);
      browser.wait(expectedCondition.visibilityOf(page.srCredentialsPage.loginOk),
        CONDITION_TIMEOUT);
      expect(page.srCredentialsPage.loginOk.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.passwordUnknown.isDisplayed()).toBe(false);
      expect(page.srCredentialsPage.passwordOk.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
    });

    it('cannot move on if Password is invalid', function () {
      page.srCredentialsPage.passwordInput.sendKeys(constants.passwordValid);
      browser.wait(expectedCondition.visibilityOf(page.srCredentialsPage.passwordUnknown),
        CONDITION_TIMEOUT);
      expect(page.srCredentialsPage.loginOk.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.passwordUnknown.isDisplayed()).toBe(true);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      expect(page.srCredentialsPage.projectSelect().isPresent()).toBe(false);
      page.formStatus.expectContainsError('The Password isn\'t valid');
    });

    it('can move on when the credentials are valid', function () {
      page.srCredentialsPage.passwordInput.clear();
      page.srCredentialsPage.passwordInput.sendKeys(constants.srPassword);
      browser.wait(expectedCondition.visibilityOf(page.srCredentialsPage.passwordOk),
        CONDITION_TIMEOUT);
      expect(page.srCredentialsPage.loginOk.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.passwordOk.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      expect(page.srCredentialsPage.projectSelect().isDisplayed()).toBe(true);
      page.formStatus.expectHasNoError();
    });

    it('cannot move on if no project is selected', function () {
      page.nextButton.click();
      expect(page.srCredentialsPage.loginInput.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      expect(page.srCredentialsPage.projectSelect().isDisplayed()).toBe(true);
      page.formStatus.expectContainsError('Please select a Project.');
    });

    it('cannot move on if not a manager of the project', function () {
      util.clickDropdownByValue(page.srCredentialsPage.projectSelect(), 'mock-name2');
      expect(page.srCredentialsPage.projectNoAccess.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      page.formStatus.expectContainsError('select a Project that you are the Manager');
    });

    it('can move on when a managed project is selected', function () {
      util.clickDropdownByValue(page.srCredentialsPage.projectSelect(), 'mock-name4');
      expect(page.srCredentialsPage.projectOk.isDisplayed()).toBe(true);
      expect(page.srCredentialsPage.projectUneditable.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
      page.expectFormIsValid();
    });

  });

  describe('Send Receive Verify page', function () {
    var expectedCondition = protractor.ExpectedConditions;
    var CONDITION_TIMEOUT = 5000;

    it('can clone project', function () {
      page.nextButton.click();
      browser.wait(expectedCondition.visibilityOf(page.srClonePage.cloning),
        CONDITION_TIMEOUT);
      expect(page.srClonePage.cloning.isDisplayed()).toBe(true);
    });

    it('cannot move on while cloning', function () {
      expect(page.nextButton.isDisplayed()).toBe(false);
      expect(page.nextButton.isEnabled()).toBe(false);
      page.expectFormIsNotValid();
    });

  });

  describe('New Project Name page', function () {

    it('can create a new project', function () {
      page.get();

      //page.chooserPage.createButton.click();  // removed while the Chooser page is hidden
      expect(page.namePage.projectNameInput.isPresent()).toBe(true);
    });

    it('cannot move on if name is invalid', function () {
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(true);
      page.formStatus.expectContainsError('Project Name cannot be empty.');
    });

    it('finds the test project already exists', function () {
      page.namePage.projectNameInput.sendKeys(constants.testProjectName + protractor.Key.TAB);
      browser.wait(expectedCondition.visibilityOf(page.namePage.projectCodeExists),
        CONDITION_TIMEOUT);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeInput.getAttribute('value'))
        .toEqual(constants.testProjectCode);
      page.formStatus.expectContainsError('Another project with code \'' +
        constants.testProjectCode + '\' already exists.');
    });

    it('with a cleared name does not show an error but is still invalid', function () {

      /**
       * FIXME: added the following two lines so the test will work (previous error wasn't clearing)
       * as I couldn't re-produce the problem manually,
       * however is likely symptomatic of some funkiness with promises. IJH 2014-12
       */
      page.namePage.projectNameInput.sendKeys('a' + protractor.Key.TAB);
      page.namePage.projectNameInput.clear();
      page.namePage.projectNameInput.sendKeys(protractor.Key.TAB);
      browser.sleep(CHECK_PAUSE);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(true);
      page.formStatus.expectContainsError('Project Name cannot be empty.');
    });

    it('can verify that an unused project name is available', function () {
      page.namePage.projectNameInput.sendKeys(constants.newProjectName + protractor.Key.TAB);
      browser.wait(expectedCondition.visibilityOf(page.namePage.projectCodeOk),
        CONDITION_TIMEOUT);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeInput.getAttribute('value'))
        .toEqual(constants.newProjectCode);
      page.formStatus.expectHasNoError();
    });

    it('can not edit project code by default', function () {
      expect(page.namePage.projectCodeInput.isDisplayed()).toBe(false);
    });

    it('can edit project code when enabled', function () {
      expect(page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
      util.setCheckbox(page.namePage.editProjectCodeCheckbox, true);
      expect(page.namePage.projectCodeInput.isDisplayed()).toBe(true);
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('changed_new_project');
      page.namePage.projectNameInput.sendKeys(protractor.Key.TAB);     // trigger project code check
      expect(page.namePage.projectCodeInput.getAttribute('value')).toEqual('changed_new_project');
      page.formStatus.expectHasNoError();
    });

    it('project code cannot be empty; does not show an error but is still invalid', function () {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectNameInput.sendKeys(protractor.Key.TAB);     // trigger project code check
      browser.sleep(CHECK_PAUSE);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
      expect(page.nextButton.isEnabled()).toBe(true);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(true);
      page.formStatus.expectContainsError('Project Code cannot be empty.');
    });

    it('project code can be one character', function () {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('a');
      page.namePage.projectNameInput.sendKeys(protractor.Key.TAB);     // trigger project code check
      browser.wait(expectedCondition.visibilityOf(page.namePage.projectCodeOk), CONDITION_TIMEOUT);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      page.formStatus.expectHasNoError();
    });

    it('project code cannot be uppercase', function () {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('A' + protractor.Key.TAB);
      browser.wait(expectedCondition.visibilityOf(page.namePage.projectCodeAlphanumeric),
        CONDITION_TIMEOUT);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      page.formStatus.expectContainsError('Project Code must begin with a letter');
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('aB' + protractor.Key.TAB);
      browser.wait(expectedCondition.visibilityOf(page.namePage.projectCodeAlphanumeric),
        CONDITION_TIMEOUT);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code cannot start with a number', function () {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('1' + protractor.Key.TAB);
      browser.wait(expectedCondition.visibilityOf(page.namePage.projectCodeAlphanumeric),
        CONDITION_TIMEOUT);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code cannot use non-alphanumeric', function () {
      page.namePage.projectCodeInput.clear();
      page.namePage.projectCodeInput.sendKeys('a?' + protractor.Key.TAB);
      browser.wait(expectedCondition.visibilityOf(page.namePage.projectCodeAlphanumeric),
        CONDITION_TIMEOUT);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(true);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(false);
      page.formStatus.expectHasNoError();
      page.nextButton.click();
      page.formStatus.expectContainsError('Project Code must begin with a letter');
    });

    it('project code reverts to default when Edit-project-code is disabled', function () {
      expect(page.namePage.editProjectCodeCheckbox.isDisplayed()).toBe(true);
      util.setCheckbox(page.namePage.editProjectCodeCheckbox, false);
      expect(page.namePage.projectCodeInput.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeInput.getAttribute('value'))
        .toEqual(constants.newProjectCode);
      page.formStatus.expectHasNoError();
    });

    it('can create project', function () {
      expect(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsValid();
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(false);
      expect(page.initialDataPage.browseButton.isPresent()).toBe(true);
      page.formStatus.expectHasNoError();
    });

  });

  describe('Initial Data page with upload', function () {

    it('cannot see back button and defaults to uploading data', function () {
      expect(page.backButton.isDisplayed()).toBe(false);
      expect(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
      expect(page.progressIndicatorStep3Label.getText()).toEqual('Verify');
      page.expectFormIsNotValid();
      page.formStatus.expectHasNoError();
    });

    describe('Mock file upload', function () {

      it('cannot upload large file', function () {
        page.initialDataPage.mockUpload.enableButton.click();
        expect(page.initialDataPage.mockUpload.fileNameInput.isPresent()).toBe(true);
        expect(page.initialDataPage.mockUpload.fileNameInput.isDisplayed()).toBe(true);
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(
          constants.testMockZipImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(134217728);
        expect(page.noticeList.count()).toBe(0);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        expect(page.verifyDataPage.entriesImported.isPresent()).toBe(false);
        expect(page.noticeList.count()).toBe(1);
        expect(page.noticeList.get(0).getText()).toContain('is too large. It must be smaller than');
        page.formStatus.expectHasNoError();
        page.initialDataPage.mockUpload.fileNameInput.clear();
        page.initialDataPage.mockUpload.fileSizeInput.clear();
        page.firstNoticeCloseButton.click();
      });

      it('cannot upload jpg', function () {
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(
          constants.testMockJpgImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(
          constants.testMockJpgImportFile.size);
        expect(page.noticeList.count()).toBe(0);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
        expect(page.verifyDataPage.entriesImported.isPresent()).toBe(false);
        expect(page.noticeList.count()).toBe(1);
        expect(page.noticeList.get(0).getText()).toContain(constants.testMockJpgImportFile.name +
          ' is not an allowed compressed file. Ensure the file is');
        page.formStatus.expectHasNoError();
        page.initialDataPage.mockUpload.fileNameInput.clear();
        page.initialDataPage.mockUpload.fileSizeInput.clear();
        page.firstNoticeCloseButton.click();
      });

      it('can upload zip file', function () {
        page.initialDataPage.mockUpload.fileNameInput.sendKeys(
          constants.testMockZipImportFile.name);
        page.initialDataPage.mockUpload.fileSizeInput.sendKeys(
          constants.testMockZipImportFile.size);
        expect(page.noticeList.count()).toBe(0);
        page.initialDataPage.mockUpload.uploadButton.click();
        expect(page.verifyDataPage.entriesImported.isDisplayed()).toBe(true);
        expect(page.noticeList.count()).toBe(1);
        expect(page.noticeList.get(0).getText()).toContain('Successfully imported ' +
          constants.testMockZipImportFile.name);
        page.formStatus.expectHasNoError();
      });

    });

  });

  describe('Verify Data page', function () {

    it('displays stats', function () {
      expect(page.verifyDataPage.title.getText()).toEqual('Verify Data');
      expect(page.verifyDataPage.entriesImported.getText())
        .toEqual('2 entries were found in the initial data.');
      page.formStatus.expectHasNoError();
    });

    // regression avoidance test - should not redirect when button is clicked
    it('displays non-critical errors', function () {
      expect(page.verifyDataPage.importErrors.isPresent()).toBe(true);
      expect(page.verifyDataPage.importErrors.isDisplayed()).toBe(false);
      page.verifyDataPage.nonCriticalErrorsButton.click();
      expect(page.verifyDataPage.title.getText()).toEqual('Verify Data');
      page.formStatus.expectHasNoError();
      expect(page.verifyDataPage.importErrors.isDisplayed()).toBe(true);
      expect(page.verifyDataPage.importErrors.getText())
        .toContain('range file \'TestProj.lift-ranges\' was not found');
      page.verifyDataPage.nonCriticalErrorsButton.click();
      browser.wait(expectedCondition.invisibilityOf(page.verifyDataPage.importErrors),
        CONDITION_TIMEOUT);
      expect(page.verifyDataPage.importErrors.isDisplayed()).toBe(false);
    });

    it('can go to lexicon', function () {
      expect(page.nextButton.isDisplayed()).toBe(true);
      expect(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsValid();
      page.nextButton.click();
      expect(editorPage.browse.getEntryCount()).toBe(2);
    });

  });

  describe('New Empty Project Name page', function () {

    it('create: new empty project', function () {
      page.get();

      //page.chooserPage.createButton.click();  // removed while the Chooser page is hidden
      page.namePage.projectNameInput.sendKeys(constants.emptyProjectName + protractor.Key.TAB);
      browser.wait(expectedCondition.visibilityOf(page.namePage.projectCodeOk), CONDITION_TIMEOUT);
      expect(page.namePage.projectCodeExists.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeAlphanumeric.isDisplayed()).toBe(false);
      expect(page.namePage.projectCodeOk.isDisplayed()).toBe(true);
      expect(page.nextButton.isEnabled()).toBe(true);

      // added sleep to ensure state is stable so the next test passes (expectFormIsNotValid)
      browser.sleep(500);
      page.nextButton.click();
      expect(page.namePage.projectNameInput.isPresent()).toBe(false);
      expect(page.initialDataPage.browseButton.isPresent()).toBe(true);
    });

  });

  describe('Initial Data page skipping upload', function () {

    it('can skip uploading data', function () {
      expect(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsNotValid();
      page.nextButton.click();
      expect(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
    });

  });

  describe('Primary Language page', function () {

    it('can go back to initial data page (then forward again)', function () {
      expect(page.backButton.isDisplayed()).toBe(true);
      expect(page.backButton.isEnabled()).toBe(true);
      page.backButton.click();
      expect(page.initialDataPage.browseButton.isDisplayed()).toBe(true);
      expect(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsNotValid();
      page.nextButton.click();
      expect(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
      expect(page.backButton.isDisplayed()).toBe(true);
    });

    it('cannot move on if language is not selected', function () {
      expect(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsNotValid();
      page.nextButton.click();
      expect(page.primaryLanguagePage.selectButton.isPresent()).toBe(true);
      page.formStatus.expectContainsError('Please select a primary language for the project.');
    });

    it('can select language', function () {
      expect(page.primaryLanguagePage.selectButton.isEnabled()).toBe(true);
      page.primaryLanguagePage.selectButtonClick();
      expect(page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(true);
    });

    describe('Select Language modal', function () {

      it('can search, select and add language', function () {
        var language = 'French';

        page.modal.selectLanguage.searchLanguageInput.sendKeys(language + protractor.Key.ENTER);
        expect(page.modal.selectLanguage.firstLanguageRow.isPresent()).toBe(true);

        expect(page.modal.selectLanguage.addButton.isPresent()).toBe(true);
        expect(page.modal.selectLanguage.addButton.isEnabled()).toBe(false);
        page.modal.selectLanguage.firstLanguageRow.click();
        expect(page.modal.selectLanguage.addButton.isEnabled()).toBe(true);
        expect(page.modal.selectLanguage.addButton.getText()).toEqual('Add ' + language);

        page.modal.selectLanguage.addButton.click();
        browser.wait(expectedCondition.stalenessOf(page.modal.selectLanguage.searchLanguageInput),
          CONDITION_TIMEOUT);
        expect(page.modal.selectLanguage.searchLanguageInput.isPresent()).toBe(false);
      });

    });

    it('can go to lexicon and primary language has changed', function () {
      page.formStatus.expectHasNoError();
      expect(page.nextButton.isEnabled()).toBe(true);
      page.expectFormIsValid();
      page.nextButton.click();
      expect(editorPage.browse.getEntryCount()).toBe(0);
      editorPage.browse.newWordBtn.click();
      expect(editorPage.edit.getEntryCount()).toBe(1);
      expect(editorPage.edit.getLexemesAsObject()).toEqual({ fr: '' });
    });

  });

});
