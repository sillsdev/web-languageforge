'use strict';

var BellowsChangePasswordPage = function() {
	
	// TODO: this will likely change when we refactor the display of notifications - cjh 2014-06
	this.get = function() {
		browser.get('/app/changepassword');
	};

	this.passwordForm  = element('form#passwordForm');
	this.passwordInput = element(by.model('vars.password'));
	this.confirmInput  = element(by.model('vars.confirm_password'));
	this.signupButton  = element(by.tagName('button')); // Might need to change this...?
};

module.exports = new BellowsChangePasswordPage();