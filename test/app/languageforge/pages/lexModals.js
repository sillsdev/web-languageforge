'use strict';

var LexModals = function() {
  
  // select language modal
  this.selectLanguage = {};
  this.selectLanguage.searchLanguageInput = element(by.model('searchText'));
  this.selectLanguage.firstLanguageRow = element(by.repeater('language in languages').row(0));
  this.selectLanguage.addButton = element(by.partialButtonText('Add'));
  
};

module.exports = new LexModals();
