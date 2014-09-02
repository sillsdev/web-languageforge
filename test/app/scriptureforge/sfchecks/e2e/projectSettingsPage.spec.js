'use strict';

afterEach(function() {
	var appFrame = require('../../../bellows/pages/appFrame.js');
	expect(appFrame.errorMessage.isPresent()).toBe(false);
});

describe('the project settings page - project manager', function() {
	var constants 		= require('../../../testConstants.json');
	var loginPage 		= require('../../../bellows/pages/loginPage.js');
	var util 			= require('../../../bellows/pages/util.js');
	var projectListPage = require('../../../bellows/pages/projectsPage.js');
	var header 			= require('../../../bellows/pages/pageHeader.js');
	var projectPage 	= require('../pages/projectPage.js');
	var page 			= require('../pages/projectSettingsPage.js');
	
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

		it('can not add the same user twice', function() {
			page.membersTab.newMember.input.clear();
			page.membersTab.newMember.input.sendKeys('dude');
			expect(page.membersTab.newMember.button.isEnabled()).toBeFalsy();
			expect(page.membersTab.newMember.warning.isDisplayed()).toBeTruthy();
			page.membersTab.newMember.input.clear();
		});

		it('can change the role of a member', function() {
			page.membersTab.listFilter.sendKeys('dude');
			util.clickDropdownByValue(page.membersTab.list.first().element(by.model('user.role')), 'Manager');
			expect(page.membersTab.list.first().element(by.model('user.role')).$('option:checked').getText()).toEqual('Manager');
			page.membersTab.listFilter.clear();
		});

		it('can remove a member', function() {
			page.membersTab.listFilter.sendKeys('dude');
			page.membersTab.list.first().element(by.css('input[type="checkbox"]')).click();
			page.membersTab.removeButton.click();
			page.membersTab.listFilter.clear();
			page.membersTab.listFilter.sendKeys('dude');
			expect(page.membersTab.list.count()).toBe(0);
			page.membersTab.listFilter.clear();
			expect(page.membersTab.list.count()).toBe(memberCount);
		});
		//it('can message selected user', function() {});  // how can we test this? - cjh

	});
	
	describe('question templates tab', function() {
		it('setup: click on tab', function() {
			expect(page.tabs.templates.isPresent()).toBe(true);
			page.tabs.templates.click();
		});
		
		it('can list templates', function() {
			expect(page.templatesTab.list.count()).toBe(2);
		});
		
		it('can add a template', function() {
			page.templatesTab.addButton.click();
			page.templatesTab.editor.title.sendKeys('sound check');
			page.templatesTab.editor.description.sendKeys('What do you think of when I say the words... "boo"');
			page.templatesTab.editor.saveButton.click();
			expect(page.templatesTab.list.count()).toBe(3);
			expect(page.templatesTab.editor.saveButton.isDisplayed()).toBe(false);
		});
		
		it('can update an existing template', function() {
			page.templatesTab.list.last().element(by.linkText('sound check')).click();
			browser.wait(function() {
				return page.templatesTab.editor.saveButton.isDisplayed();
			});
			expect(page.templatesTab.editor.saveButton.isDisplayed()).toBe(true);
			page.templatesTab.editor.title.clear();
			page.templatesTab.editor.title.sendKeys('test12');
			page.templatesTab.editor.saveButton.click();
			expect(page.templatesTab.editor.saveButton.isDisplayed()).toBe(false);
			expect(page.templatesTab.list.count()).toBe(3);

		});
		
		it('can delete a template', function() {
			page.templatesTab.list.last().element(by.css('input[type="checkbox"]')).click();
			page.templatesTab.removeButton.click();
			expect(page.templatesTab.list.count()).toBe(2);
		});
		
		
	});
	
	// The Archived Texts tab is tested as part of a process in the Project page tests. IJH 2014-06
	
	describe('project properties tab', function() {
		var newName = constants.thirdProjectName;

		it('setup: click on tab', function() {
			expect(page.tabs.projectProperties.isPresent()).toBe(true);
			page.tabs.projectProperties.click();
		});
		
		it('can read properties', function() {
			expect(page.propertiesTab.name.getAttribute('value')).toBe(constants.testProjectName);
			//expect(page.propertiesTab.featured.getAttribute('checked')).toBeFalsy();
			expect(page.propertiesTab.allowAudioDownload.getAttribute('checked')).toBeTruthy();
		});

		it('can change properties and verify they persist', function() {
			page.propertiesTab.name.clear();
			page.propertiesTab.name.sendKeys(newName);
			//page.propertiesTab.featured.click();
			page.propertiesTab.allowAudioDownload.click();
			page.propertiesTab.button.click();
			browser.navigate().refresh();
			page.tabs.projectProperties.click();
			expect(page.propertiesTab.name.getAttribute('value')).toBe(newName);
			//expect(page.propertiesTab.featured.getAttribute('checked')).toBeTruthy();
			expect(page.propertiesTab.allowAudioDownload.getAttribute('checked')).toBeFalsy();
			page.propertiesTab.button.click();
	    	projectListPage.get();
	    	projectListPage.clickOnProject(newName);
	    	projectPage.settingsButton.click();
			page.tabs.projectProperties.click();
			page.propertiesTab.name.clear();
			page.propertiesTab.name.sendKeys(constants.testProjectName);
			//page.propertiesTab.featured.click();
			page.propertiesTab.button.click();
		});

	});

	describe('user profile lists', function() {
		it('setup: click on tab and select the Location list for editing', function() {
			page.tabs.optionlists.click();
			util.findRowByText(page.optionlistsTab.editList, "Study Group").then(function(row) {
				row.click();
			});
		});
		it('can add two values to a list', function() {
			expect(page.optionlistsTab.editContentsList.count()).toBe(0);
			page.optionlistsTab.addInput.sendKeys("foo");
			page.optionlistsTab.addButton.click();
			expect(page.optionlistsTab.editContentsList.count()).toBe(1);
			page.optionlistsTab.addInput.sendKeys("bar");
			page.optionlistsTab.addButton.click();
			expect(page.optionlistsTab.editContentsList.count()).toBe(2);
		});
		/* Skipping this test because testing the drag-and-drop is proving much harder than expected. 2013-06 RM
		it('can rearrange the values', function() {
			var foo = util.findRowByText(page.optionlistsTab.editContentsList, "foo");
			var bar = util.findRowByText(page.optionlistsTab.editContentsList, "bar");
			util.findRowByFunc(page.optionlistsTab.editContentsList, console.log).then(function() {
				console.log("That's all, folks.");
			});
			foo.then(function(elem) {
				console.log("Found it.");
				//browser.actions().dragAndDrop(elem.getWebElement(), { x: 0, y: 30 } ).perform();
			});
			browser.sleep(5000);
		});
		*/
		 
		it('can delete values from the list', function() {
			expect(page.optionlistsTab.editContentsList.count()).toBe(2);
			page.optionlistsTab.editContentsList.first().then(function(elem) { page.optionlistsTab.deleteButton(elem).click(); });
			expect(page.optionlistsTab.editContentsList.count()).toBe(1);
			page.optionlistsTab.editContentsList.first().then(function(elem) { page.optionlistsTab.deleteButton(elem).click(); });
			expect(page.optionlistsTab.editContentsList.count()).toBe(0);
		});
	});

	describe('communication settings tab', function() {
		it('is not visible for project manager', function() {
			expect(page.tabs.communication.isPresent()).toBe(false);
		});
		describe('as a system admin', function() {
			it('setup: logout, login as system admin, go to project settings', function() {
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

				browser.navigate().refresh();
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
