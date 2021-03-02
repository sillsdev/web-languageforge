import {browser, by, element} from 'protractor';

import {MockUploadElement} from '../../../bellows/shared/mock-upload.element';
import {LexModals} from './lex-modals.util';

export class NewLexProjectPage {
  private readonly mockUpload = new MockUploadElement();

  modal = new LexModals();

  static get() {
    return browser.get(browser.baseUrl + '/app/lexicon/new-project');
  }

  // form controls
  noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  firstNoticeCloseButton = this.noticeList.first().element(by.partialButtonText('×'));
  newLexProjectForm = element(by.id('new-lex-project-form'));
  progressIndicatorStep3Label = element(by.id('progress-indicator-step3-label'));
  backButton = element(by.id('back-button'));
  nextButton = element(by.id('next-button'));

  async expectFormIsValid() {
    expect(await this.nextButton.getAttribute('class')).toMatch(/btn-primary(?:\s|$)/);
  }

  async expectFormIsNotValid() {
    expect(await this.nextButton.getAttribute('class')).not.toMatch(/btn-primary(?:\s|$)/);
  }

  formStatus = {
    async expectHasNoError() {
      expect(await element(by.id('form-status')).getAttribute('class')).not.toContain('alert');
    },
    async expectContainsError(partialMsg: string) {
      if (!partialMsg) partialMsg = '';
      expect(await element(by.id('form-status')).getAttribute('class')).toContain('alert-danger');
      expect(await element(by.id('form-status')).getText()).toContain(partialMsg);
    }
  };

  // step 0: chooser
  chooserPage = {
    sendReceiveButton: element(by.id('send-receive-button')),
    createButton: element(by.id('create-button'))
  };
  // step 1: send receive credentials
  srCredentialsPage = {
    loginInput: element(by.id('sr-username')),
    loginOk: element(by.id('username-ok')),
    passwordInput: element(by.id('sr-password')),
    credentialsInvalid: element(by.id('credentials-invalid')),
    passwordOk: element(by.id('password-ok')),
    projectNoAccess: element(by.id('project-no-access')),
    projectOk: element(by.id('project-ok')),
    projectSelect() {
      return element(by.id('sr-project-select'));
    }
  };

  // step 1: project name
  namePage = {
    projectNameInput: element(by.id('project-name')),
    projectCodeInput: element(by.id('project-code')),
    projectCodeUneditableInput: element(by.id('project-code-uneditable')),
    projectCodeLoading: element(by.id('project-code-loading')),
    projectCodeExists: element(by.id('project-code-exists')),
    projectCodeAlphanumeric: element(by.id('project-code-alphanumeric')),
    projectCodeOk: element(by.id('project-code-ok')),
    editProjectCodeCheckbox: element(by.id('edit-project-code'))
  };
  // step 2: initial data
  initialDataPage = {
    browseButton: element(by.id('browse-button')),
    mockUpload: this.mockUpload
  };
  // step 3: verify data
  verifyDataPage = {
    title: element(by.id('new-project-verify')),
    nonCriticalErrorsButton: element(by.id('non-critical-errors-button')),
    entriesImported: element(by.id('entries-imported')),
    importErrors: element(by.id('import-errors'))
  };
  // step 3 alternate: primary language
  primaryLanguagePage = {
    selectButton: element(by.id('select-language-button')),
    // tslint:disable-next-line:max-line-length
    // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
    async selectButtonClick() {
      await element(by.id('select-language-button')).click();
      return browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
    }
  };
  // step 3 alternate: send receive clone
  srClonePage = {
    cloning: element(by.id('cloning'))
  };

}
