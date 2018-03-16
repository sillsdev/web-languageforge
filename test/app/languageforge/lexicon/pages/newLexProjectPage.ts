import {browser, by, element} from 'protractor';

import {MockUploadElement} from '../../../bellows/pages/mockUploadElement';
import {LexModals} from './lexModals';

export class NewLexProjectPage {
  private readonly mockUpload = new MockUploadElement();

  modal = new LexModals();

  get() {
    browser.get(browser.baseUrl + '/app/lexicon/new-project');
  }

  // form controls
  noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  firstNoticeCloseButton = this.noticeList.first().element(by.partialButtonText('×'));
  newLexProjectForm = element(by.id('newLexProjectForm'));
  progressIndicatorStep3Label = element(by.binding('progressIndicatorStep3Label'));
  backButton = element(by.id('backButton'));
  nextButton = element(by.id('nextButton'));

  expectFormIsValid() {
    expect(this.nextButton.getAttribute('class')).toMatch(/btn-primary(?:\s|$)/);
  }

  expectFormIsNotValid() {
    expect(this.nextButton.getAttribute('class')).not.toMatch(/btn-primary(?:\s|$)/);
  }

  formStatus = {
    expectHasNoError() {
      expect(element(by.id('form-status')).getAttribute('class')).not.toContain('alert');
    },
    expectContainsError(partialMsg: string) {
      if (!partialMsg) partialMsg = '';
      expect(element(by.id('form-status')).getAttribute('class')).toContain('alert-danger');
      expect(element(by.id('form-status')).getText()).toContain(partialMsg);
    }
  };

  // step 0: chooser
  chooserPage = {
    sendReceiveButton: element(by.id('sendReceiveButton')),
    createButton: element(by.id('createButton'))
  };
  // step 1: send receive credentials
  srCredentialsPage = {
    loginInput: element(by.id('srUsername')),
    loginOk: element(by.id('usernameOk')),
    passwordInput: element(by.id('srPassword')),
    credentialsInvalid: element(by.id('credentialsInvalid')),
    passwordOk: element(by.id('passwordOk')),
    projectNoAccess: element(by.id('projectNoAccess')),
    projectOk: element(by.id('projectOk')),
    projectSelect() {
      return element(by.id('srProjectSelect'));
    }
  };

  // step 1: project name
  namePage = {
    projectNameInput: element(by.model('newProject.projectName')),
    projectCodeInput: element(by.model('newProject.projectCode')),
    projectCodeUneditableInput: element(by.binding('newProject.projectCode')),
    projectCodeLoading: element(by.id('projectCodeLoading')),
    projectCodeExists: element(by.id('projectCodeExists')),
    projectCodeAlphanumeric: element(by.id('projectCodeAlphanumeric')),
    projectCodeOk: element(by.id('projectCodeOk')),
    editProjectCodeCheckbox: element(by.model('newProject.editProjectCode'))
  };
  // step 2: initial data
  initialDataPage = {
    browseButton: element(by.id('browseButton')),
    mockUpload: this.mockUpload
  };
  // step 3: verify data
  verifyDataPage = {
    title: element(by.id('new-project-verify')),
    nonCriticalErrorsButton: element(by.id('nonCriticalErrorsButton')),
    entriesImported: element(by.binding('newProject.entriesImported')),
    importErrors: element(by.binding('newProject.importErrors'))
  };
  // step 3 alternate: primary language
  primaryLanguagePage = {
    selectButton: element(by.id('selectLanguageButton')),
    // tslint:disable-next-line:max-line-length
    // see http://stackoverflow.com/questions/25553057/making-protractor-wait-until-a-ui-boostrap-modal-box-has-disappeared-with-cucum
    selectButtonClick() {
      element(by.id('selectLanguageButton')).click();
      browser.executeScript('$(\'.modal\').removeClass(\'fade\');');
    }
  };
  // step 3 alternate: send receive clone
  srClonePage = {
    cloning: element(by.id('cloning'))
  };

}
