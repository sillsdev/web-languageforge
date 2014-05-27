'use strict';

var SfProjectSettingsPage = function() {
	
	this.tabs = {
		members:			element(by.linkText('Members')),
		templates:			element(by.linkText('Question Templates')),
		projectProperties:	element(by.linkText('Project Properties')),
		optionlists:		element(by.linkText('Project Setup')),
		communication:		element(by.linkText('Communication Settings'))
	};
	
	this.membersTab = {
		addButton:		element(by.partialButtonText('Add Members')),
		removeButton:	element(by.partialButtonText('Remove Members')),
		messageButton:	element(by.partialButtonText('Message Selected Users')),
		listFilter:		element(by.model('userFilter')),
		list:			element.all(by.repeater('user in list.visibleUsers'))
	};

	this.templatesTab = {}; // NYI - wait for refactor
	
	this.propertiesTab = {
		name:		element(by.model('project.projectname')),
		code:		element(by.model('project.projectCode')),
		featured:	element(by.model('project.featured'))
	};
	
	this.optionlistsTab = {}; // NYI - wait for refactor
	
	this.communicationTab = {
		sms: {
			accountId:		element(by.model('settings.sms.accountId')),
			authToken:		element(by.model('settings.sms.authToken')),
			number:			element(by.model('settings.sms.fromNumber')),
		},
		email: {
			address:		element(by.model('settings.sms.fromAddress')),
			name:			element(by.model('settings.sms.fromName')),
		}
	};
	
};

module.exports = new SfProjectSettingsPage();