'use strict';

function LexModals() {

  // select language modal
  this.selectLanguage = {
    searchLanguageInput: element(by.model('searchText')),
    languageRows: element.all(by.repeater('language in languages')),
    firstLanguageName: element.all(by.repeater('language in languages').column('name')).first(),
    lastLanguageName: element.all(by.repeater('language in languages').column('name')).last(),
    addButton: element(by.partialButtonText('Add')),
    clearSearchButton: element(by.className('fa-times')),
  };
  this.selectLanguage.firstLanguageRow = this.selectLanguage.languageRows.first();
  this.selectLanguage.lastLanguageRow = this.selectLanguage.languageRows.last();

  // custom field modal
  this.customField = {
    displayNameInput: element(by.model('newCustomData.name')),
    fieldCodeExists: element(by.id('fieldCodeExists')),
    levelDropdown: element(by.model('newCustomData.level')),
    typeDropdown: element(by.model('newCustomData.type')),
    listCodeDropdown: element(by.model('newCustomData.listCode')),
    addButton: element(by.partialButtonText('Add')),
  };

}

module.exports = new LexModals();
