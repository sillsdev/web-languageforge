'use strict';

function LexModals() {
  
  // select language modal
  this.selectLanguage = {};
  this.selectLanguage.searchLanguageInput = element(by.model('searchText'));
  this.selectLanguage.firstLanguageRow = element.all(by.repeater('language in languages')).first();
  this.selectLanguage.firstLanguageName = element.all(by.repeater('language in languages').column('name')).first();
  this.selectLanguage.lastLanguageRow = element.all(by.repeater('language in languages')).last();
  this.selectLanguage.lastLanguageName = element.all(by.repeater('language in languages').column('name')).last();
  this.selectLanguage.addButton = element(by.partialButtonText('Add'));
  this.selectLanguage.clearSearchButton = element(by.css('span .icon-remove'));
  
};

module.exports = new LexModals();
