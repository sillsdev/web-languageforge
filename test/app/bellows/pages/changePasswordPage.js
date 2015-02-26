'use strict';

var BellowsChangePasswordPage = function() {
  
  // TODO: this will likely change when we refactor the display of notifications - cjh 2014-06
  this.get = function() {
    browser.get('/app/changepassword');
  };

  this.form  = element('form#passwordForm');
  this.password = element(by.model('vars.password'));
  this.confirm  = element(by.model('vars.confirm_password'));
  this.submitButton = element(by.partialButtonText('Change Password'));
};

module.exports = new BellowsChangePasswordPage();