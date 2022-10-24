import { expect, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class NewLexProjectPage extends BasePage {

  // form controls
  readonly backButton = this.page.locator('#back-button');
  readonly nextButton = this.page.locator('#next-button');
  readonly formStatus = this.page.locator('#form-status');
  readonly progressIndicatorStep3Label = this.page.locator('#progress-indicator-step3-label');

  // step 0: chooser
  readonly chooserPage = {
    sendReceiveButton: this.page.locator('#send-receive-button'),
    createButton: this.page.locator('#create-button'),
  };

  // step 1: project name
  readonly namePage = {
    projectNameInput: this.page.locator('#project-name'),
    projectCodeInput: this.page.locator('#project-code'),
    projectCodeUneditableInput: this.page.locator('#project-code-uneditable'),
    projectCodeLoading: this.page.locator('#project-code-loading'),
    projectCodeExists: this.page.locator('#project-code-exists'),
    projectCodeAlphanumeric: this.page.locator('#project-code-alphanumeric'),
    projectCodeOk: this.page.locator('#project-code-ok'),
    editProjectCodeCheckbox: this.page.locator('#edit-project-code')
  };

  // step 1: send receive credentials
  readonly srCredentialsPage = {
    loginInput: this.page.locator('#sr-username'),
    loginOk: this.page.locator('#username-ok'),
    passwordInput: this.page.locator('#sr-password'),
    credentialsInvalid: this.page.locator('#credentials-invalid'),
    passwordOk: this.page.locator('#password-ok'),
    projectNoAccess: this.page.locator('#project-no-access'),
    projectOk: this.page.locator('#project-ok'),
    projectSelect: this.page.locator('#sr-project-select')
  }

  // step 2: initial data
  readonly initialDataPageBrowseButton = this.page.locator('#browse-button');

  // step 3: verify data
  readonly verifyDataPage = {
    title: this.page.locator('#new-project-verify'),
    nonCriticalErrorsButton: this.page.locator('#non-critical-errors-button'),
    entriesImported: this.page.locator('#entries-imported'),
    importErrors: this.page.locator('#import-errors'),
  };

  // step 3 alternate: primary language
  readonly primaryLanguagePageSelectButton = this.page.locator('#select-language-button');

  // select language modal
  readonly selectLanguage = {
    searchLanguageInput: this.page.locator('.modal-body >> #search-text-input'),
    languageRows: this.page.locator('.modal-body >> [data-ng-repeat*="language in $ctrl.languages"]'),
    addButton: this.page.locator('.modal-footer >> #select-language-add-btn'),
  };

  constructor(page: Page) {
    super(page, '/app/lexicon/new-project', page.locator('#new-lex-project-form'));
  }

  async expectFormStatusHasNoError() {
    // this expect was flaky; suspicion: await and retry do not work properly with the "not" negation
    await expect(this.formStatus).not.toHaveClass('alert-danger');
    // this regular expression finds everything not containing "alert-danger"
    // await expect(this.formStatus).toHaveClass(/^((?!alert-danger).)*$/);
  }

  async expectFormStatusHasError() {
    await expect(this.formStatus).toHaveClass(/alert-danger/);
  }

  async expectFormIsValid() {
    await expect(this.nextButton).toHaveClass(/btn-primary(?:\s|$)/);
  }

  async expectFormIsNotValid() {
    await expect(this.nextButton).not.toHaveClass(/btn-primary(?:\s|$)/);
  }

}
