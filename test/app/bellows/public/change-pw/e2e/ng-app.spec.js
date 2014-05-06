'use strict';

var SfChangePasswordPage = function() {
	this.get = function() {
		browser.get('http://jamaicanpsalms.scriptureforge.local/app/changepassword');
	};
	// Do the 
	this.passwordForm = element('form#passwordForm');
	this.passwordInput = element(by.model('vars.password'));
	this.confirmInput = element(by.model('vars.confirm_password'));
	this.signupButton = element(by.tagName('button')); // Might need to change this...?
}; 

describe('E2E testing: Change password', function() {
	var sfChangePasswordPage = new SfChangePasswordPage();
	
	beforeEach(function() {
		sfChangePasswordPage.get();
	});
	
	it('contains a password form', function() {
		expect(sfChangePasswordPage.passwordForm).toBeDefined();
	});
	
	it('refuses to allow form submission if the confirm input does not match', function() {
		sfChangePasswordPage.passwordInput.sendKeys('abc123').then(function() {
			sfChangePasswordPage.confirmInput.sendKeys('abcd1234').then(function() {
				expect(sfChangePasswordPage.signupButton.isEnabled()).toBeFalsy();
			});
		});
	});
	
});
