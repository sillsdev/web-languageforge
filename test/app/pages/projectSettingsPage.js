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
		list:			element.all(by.repeater('user in list.visibleUsers')),
		newMember:		{
							input:		element(by.model('term')),
							button:		element(by.model('addMode')),
							results:	$('.typeahead').$('ul li')
						}
	};
	
	this.addNewMember = function(name) {
		this.tabs.members.click();
		this.membersTab.addButton.click();
		this.membersTab.newMember.input.sendKeys(name);
		this.membersTab.newMember.button.click();
	};

	this.templatesTab = {}; // NYI - wait for refactor
	
	this.propertiesTab = {
		name:		element(by.model('project.projectname')),
		code:		element(by.model('project.projectCode')),
		featured:	element(by.model('project.featured')),
		button:		element(by.id('project_properties_save_button'))
	};
	
	this.optionlistsTab = {}; // NYI - wait for refactor
	
	this.communicationTab = {
		sms: {
			accountId:		element(by.model('settings.sms.accountId')),
			authToken:		element(by.model('settings.sms.authToken')),
			number:			element(by.model('settings.sms.fromNumber')),
		},
		email: {
			address:		element(by.model('settings.email.fromAddress')),
			name:			element(by.model('settings.email.fromName')),
		},
		button:				element(by.id('communication_settings_save_button'))
	};
	
};

module.exports = new SfProjectSettingsPage();