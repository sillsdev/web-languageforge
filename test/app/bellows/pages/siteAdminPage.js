'use strict';

var SiteAdminPage = function() {
	var page = this;
	this.url = browser.baseUrl + '/app/siteadmin';
	this.get = function() {
		browser.get(this.url);
	};
	this.go = this.get; // Alternate name
	this.addBtn = element(by.partialButtonText('Add New'));
	this.userFilterInput = element(by.model('filterUsers'));
	this.usernameInput = element(by.model('record.username'));
	this.nameInput = element(by.model('record.name'));
	this.emailInput = element(by.model('record.email'));
	// this.roleInput = element(by.model('record.role')); // Not needed right now as "User" is default role
	this.activeCheckbox = element(by.model('record.active'));
	this.passwordInput = element(by.model('record.password'));

	this.clearForm = function() {
		this.usernameInput.clear();
		this.nameInput.clear();
		this.emailInput.clear();
		this.passwordInput.clear();
		//this.activeCheckbox.clear();
	};
};

module.exports = SiteAdminPage;