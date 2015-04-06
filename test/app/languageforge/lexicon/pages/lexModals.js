'use strict';

function LexModals() {
  
  // select language modal
  this.selectLanguage = {
    searchLanguageInput: element(by.model('searchText')),
    firstLanguageRow: element.all(by.repeater('language in languages')).first(),
    firstLanguageName: element.all(by.repeater('language in languages').column('name')).first(),
    lastLanguageRow: element.all(by.repeater('language in languages')).last(),
    lastLanguageName: element.all(by.repeater('language in languages').column('name')).last(),
    addButton: element(by.partialButtonText('Add')),
    clearSearchButton: element(by.css('span .icon-remove'))
  };
  
  // custom field modal
  this.customField = {
    displayNameInput: element(by.model('newCustomData.name')),
    fieldCodeExists: element(by.id('fieldCodeExists')),
    levelDropdown: element(by.model('newCustomData.level')),
    typeDropdown: element(by.model('newCustomData.type')),
    listCodeDropdown: element(by.model('newCustomData.listCode')),
    addButton: element(by.partialButtonText('Add'))
  };
  
};

module.exports = new LexModals();
