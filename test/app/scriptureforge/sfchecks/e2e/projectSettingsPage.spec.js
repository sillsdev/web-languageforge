'use strict';

describe('the project settings page - project manager', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var page = require('../../../pages/projectSettingsPage.js');

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
		var memberCount = 0;
		it('setup: click on tab', function() {
			expect(page.tabs.members.isPresent()).toBe(true);
			page.tabs.members.click();
		});

		it('can list project members', function() {
			expect(page.membersTab.list.count()).toBeGreaterThan(0);
			page.membersTab.list.count().then(function(val) { memberCount = val; });
		});

		it('can filter the list of members', function() {
			expect(page.membersTab.list.count()).toBe(memberCount);
			page.membersTab.listFilter.sendKeys(constants.managerUsername);
			expect(page.membersTab.list.count()).toBe(1);
			page.membersTab.listFilter.clear();
		});

		it('can add a new user as a member', function() {
			page.membersTab.addButton.click();
			page.membersTab.newMember.input.sendKeys('dude');
			//this.membersTab.newMember.results.click();
			page.membersTab.newMember.button.click();
			expect(page.membersTab.list.count()).toBe(memberCount+1);
		});

		it('can change the role of a member', function() {
			page.membersTab.listFilter.sendKeys('dude');
			util.clickDropdownByValue(page.membersTab.list.first().findElement(by.model('user.role')), 'Manager');
			expect(page.membersTab.list.first().findElement(by.selectedOption('user.role')).getText()).toEqual('Manager');
			page.membersTab.listFilter.clear();
		});

		it('can remove a member', function() {
			page.membersTab.listFilter.sendKeys('dude');
			page.membersTab.list.first().findElement(by.css('input[type="checkbox"]')).click();
			page.membersTab.removeButton.click();
			page.membersTab.listFilter.clear();
			page.membersTab.listFilter.sendKeys('dude');
			expect(page.membersTab.list.count()).toBe(0);
			page.membersTab.listFilter.clear();
			expect(page.membersTab.list.count()).toBe(memberCount);
		});
		//it('can message selected user', function() {});  // how can we test this? - cjh

	});
	
	describe('question templates tab - NYI', function() {
		it('setup: click on tab', function() {});
		// intentionally ignoring these tests because of an impending refactor regarding question templates
		
	});
	
	describe('project properties tab', function() {
		var newName = constants.thirdProjectName;
		var newCode = 'new_kid';
		it('setup: click on tab', function() {
			expect(page.tabs.projectProperties.isPresent()).toBe(true);
			page.tabs.projectProperties.click();
		});
		
		it('can read properties', function() {
			expect(page.propertiesTab.name.getAttribute('value')).toBe(constants.testProjectName);
			expect(page.propertiesTab.code.getAttribute('value')).toBe(constants.testProjectCode);
			expect(page.propertiesTab.featured.getAttribute('checked')).toBeFalsy();
		});

		it('can change properties and verify they persist', function() {
			page.propertiesTab.name.clear();
			page.propertiesTab.name.sendKeys(newName);
			page.propertiesTab.code.clear();
			page.propertiesTab.code.sendKeys(newCode);
			page.propertiesTab.featured.click();
			page.propertiesTab.button.click();
			browser.navigate().back();
			projectPage.settingsButton.click();
			page.tabs.projectProperties.click();
			expect(page.propertiesTab.name.getAttribute('value')).toBe(newName);
			expect(page.propertiesTab.code.getAttribute('value')).toBe(newCode);
			expect(page.propertiesTab.featured.getAttribute('checked')).toBeTruthy();
	    	projectListPage.get();
	    	projectListPage.clickOnProject(newName);
	    	projectPage.settingsButton.click();
			page.tabs.projectProperties.click();
			page.propertiesTab.name.clear();
			page.propertiesTab.name.sendKeys(constants.testProjectName);
			page.propertiesTab.code.clear();
			page.propertiesTab.code.sendKeys(constants.testProjectCode);
			page.propertiesTab.featured.click();
			page.propertiesTab.button.click();
		});

	});
	
	describe('project setup tab - NYI', function() {
		it('setup: click on tab', function() {});
		// intentionally ignoring these tests because of an impending refactor regarding option lists
	});

	describe('communication settings tab', function() {
		it('is not visible for project manager', function() {
			expect(page.tabs.communication.isPresent()).toBe(false);
		});
		describe('as a site admin', function() {
			it('setup: logout, login as site admin, go to project settings', function() {
				loginPage.logout();
				loginPage.loginAsAdmin();
		    	projectListPage.get();
		    	projectListPage.clickOnProject(constants.testProjectName);
		    	projectPage.settingsButton.click();
			});
			it('the communication settings tab is visible', function() {
				expect(page.tabs.communication.isPresent()).toBe(true);
				page.tabs.communication.click();
			});
			it('can persist communication fields', function() {
				expect(page.communicationTab.sms.accountId.getAttribute('value')).toBe('');
				expect(page.communicationTab.sms.authToken.getAttribute('value')).toBe('');
				expect(page.communicationTab.sms.number.getAttribute('value')).toBe('');
				expect(page.communicationTab.email.address.getAttribute('value')).toBe('');
				expect(page.communicationTab.email.name.getAttribute('value')).toBe('');

				var sample = {a:'12345', b:'78', c:'90', d:'email@me.com', e:'John Smith'};
				page.communicationTab.sms.accountId.sendKeys(sample.a);
				page.communicationTab.sms.authToken.sendKeys(sample.b);
				page.communicationTab.sms.number.sendKeys(sample.c);
				page.communicationTab.email.address.sendKeys(sample.d);
				page.communicationTab.email.name.sendKeys(sample.e);
				page.communicationTab.button.click();

				browser.navigate().back();
				projectPage.settingsButton.click();
				page.tabs.communication.click();

				expect(page.communicationTab.sms.accountId.getAttribute('value')).toBe(sample.a);
				expect(page.communicationTab.sms.authToken.getAttribute('value')).toBe(sample.b);
				expect(page.communicationTab.sms.number.getAttribute('value')).toBe(sample.c);
				expect(page.communicationTab.email.address.getAttribute('value')).toBe(sample.d);
				expect(page.communicationTab.email.name.getAttribute('value')).toBe(sample.e);
			});
		});
	});
	
});
