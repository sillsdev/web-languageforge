import {browser, element, by, By, $, $$, ExpectedConditions} from 'protractor';

export class LexModals {
  modalBodyDiv = element(by.className('modal-body'));
  modalFooterDiv = element(by.className('modal-footer'));

  // select language modal
  selectLanguage = {
    searchLanguageInput: this.modalBodyDiv.element(by.model('searchText')),
    languageRows: this.modalBodyDiv.all(by.repeater('language in languages')),
    firstLanguageName: this.modalBodyDiv
      .all(by.repeater('language in languages').column('name')).first(),
    lastLanguageName: this.modalBodyDiv
      .all(by.repeater('language in languages').column('name')).last(),
    clearSearchButton: this.modalBodyDiv.element(by.id('clearSearch')),
    addButton: this.modalFooterDiv.element(by.id('select-language-add-btn'))
  }

  // custom field modal
  customField = {
    displayNameInput: element(by.id('name')),
    fieldCodeExists: element(by.id('fieldCodeExists')),
    levelDropdown: element(by.id('level')),
    typeDropdown: element(by.id('type')),
    listCodeDropdown: element(by.id('optionListCode')),
    addButton: element(by.id('addCustomFieldButton'))
  }
}

module.exports = new LexModals();
