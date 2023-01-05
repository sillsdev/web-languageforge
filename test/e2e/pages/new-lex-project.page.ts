import { expect, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class NewLexProjectPage extends BasePage {

  // form controls
  readonly backButton = this.locator('#back-button');
  readonly nextButton = this.locator('#next-button');
  readonly formStatus = this.locator('#form-status');
  readonly progressIndicatorStep3Label = this.locator('#progress-indicator-step3-label');

  // step 0: chooser
  readonly chooserPage = {
    sendReceiveButton: this.locator('#send-receive-button'),
    createButton: this.locator('#create-button'),
  };

  // step 1: project name
  readonly namePage = {
    projectNameInput: this.locator('#project-name'),
    projectCodeInput: this.locator('#project-code'),
    projectCodeUneditableInput: this.locator('#project-code-uneditable'),
    projectCodeLoading: this.locator('#project-code-loading'),
    projectCodeExists: this.locator('#project-code-exists'),
    projectCodeAlphanumeric: this.locator('#project-code-alphanumeric'),
    projectCodeOk: this.locator('#project-code-ok'),
    editProjectCodeCheckbox: this.locator('#edit-project-code')
  };

  // step 1: send receive credentials
  readonly srCredentialsPage = {
    loginInput: this.locator('#sr-username'),
    loginOk: this.locator('#username-ok'),
    passwordInput: this.locator('#sr-password'),
    credentialsInvalid: this.locator('#credentials-invalid'),
    passwordOk: this.locator('#password-ok'),
    projectNoAccess: this.locator('#project-no-access'),
    projectOk: this.locator('#project-ok'),
    projectSelect: this.locator('#sr-project-select')
  }

  // step 2: initial data
  readonly initialDataPageBrowseButton = this.locator('#browse-button');

  // step 3: verify data
  readonly verifyDataPage = {
    title: this.locator('#new-project-verify'),
    nonCriticalErrorsButton: this.locator('#non-critical-errors-button'),
    entriesImported: this.locator('#entries-imported'),
    importErrors: this.locator('#import-errors'),
  };

  // step 3 alternate: primary language
  readonly primaryLanguagePageSelectButton = this.locator('#select-language-button');

  // select language modal
  readonly selectLanguage = {
    searchLanguageInput: this.locator('.modal-body >> #search-text-input'),
    languageRows: this.locator('.modal-body >> [data-ng-repeat*="language in $ctrl.languages"]'),
    addButton: this.locator('.modal-footer >> #select-language-add-btn'),
  };

  constructor(page: Page) {
    super(page, '/app/lexicon/new-project', page.locator('#new-lex-project-form'));
  }

  async expectFormStatusHasNoError() {
    await expect(this.formStatus).not.toHaveClass(/alert-danger/);
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
