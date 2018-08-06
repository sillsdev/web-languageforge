import {by, element} from 'protractor';

export class LexModals {
  modalBodyDiv = element(by.className('modal-body'));
  modalFooterDiv = element(by.className('modal-footer'));
  modalBodyText = element(by.id('modal-body-text'));

  // select language modal
  selectLanguage = {
    searchLanguageInput: this.modalBodyDiv.element(by.id('search-text-input')),
    languageRows: this.modalBodyDiv.all(by.repeater('language in $ctrl.languages')),
    firstLanguageName: this.modalBodyDiv
      .all(by.repeater('language in $ctrl.languages').column('name')).first(),
    lastLanguageName: this.modalBodyDiv.all(by.repeater('language in $ctrl.languages').column('name')).last(),
    clearSearchButton: this.modalBodyDiv.element(by.className('clear-search-button')),
    addButton: this.modalFooterDiv.element(by.id('select-language-add-btn'))
  };

  // custom field modal
  customField = {
    displayNameInput: element(by.id('name')),
    fieldCodeExists: element(by.id('fieldCodeExists')),
    levelDropdown: element(by.id('level')),
    typeDropdown: element(by.id('type')),
    listCodeDropdown: element(by.id('optionListCode')),
    addButton: element(by.id('addCustomFieldButton'))
  };
}
