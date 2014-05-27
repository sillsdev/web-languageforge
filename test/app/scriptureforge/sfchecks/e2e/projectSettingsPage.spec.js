'use strict';

describe('the project settings page - project manager', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var settingsPage = require('../../../pages/projectSettingsPage.js');

	var questionListPage = require('../../../pages/textPage.js');
	var loginPage = require('../../../pages/loginPage.js');
	var util = require('../../../pages/util.js');
	var constants = require('../../../../testConstants.json');
	
	it('setup: logout, login as project manager, go to project settings', function() {
		loginPage.logout();
		loginPage.loginAsManager();
    	projectListPage.get();
    	projectListPage.clickOnProject(constants.testProjectName);
    	projectPage.settingsButton.click();
	});
	
	describe('members tab', function() {
		it('setup: click on tab', function() {});
		it('can list project members', function() {});
		it('can filter the list of members', function() {});
		it('can add a member', function() {});
		it('can change the role of a member', function() {});
		it('can remove a member', function() {});
		//it('can message selected user', function() {});  // how can we test this? - cjh

	});
	
	describe('question templates tab', function() {
		it('setup: click on tab', function() {});
		// intentionally ignoring these tests because of an impending refactor regarding question templates
		
	});
	
	describe('project properties tab', function() {
		it('setup: click on tab', function() {});
		it('can change the project name', function() {});
		it('can change the project code', function() {});
		it('can make the project featured on the website', function() {});
	});
	
	describe('project properties tab', function() {
		it('setup: click on tab', function() {});
		// intentionally ignoring these tests because of an impending refactor regarding option lists
	});

	// TODO: why is communication tab not showing up for default theme?
	describe('communication settings tab', function() {
		it('setup: click on tab', function() {
			settingsPage.tabs.projectProperties.click();
			//settingsPage.tabs.communication.click();
			browser.sleep(5000);
			//expect(settingsPage.communicationTab.sms.accountId.isPresent()).toBe(true);
		});
		it('can persist communication fields', function() {});
	});
	
});
