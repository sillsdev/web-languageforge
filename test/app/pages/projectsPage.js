'use strict';

var projectTypes = {
	'sf': 'Community Scripture Checking', // ScriptureForge
	'lf': 'Web Dictionary', // LanguageForge
};

var util = require('./util');

var SfProjectsPage = function() {
	var page = this;
	this.url = "/app/projects";
	this.get = function() {
		browser.get(browser.baseUrl + this.url);
	};

	this.testProjectName = 'Test Project';

	this.deleteBtn = element(by.partialButtonText('Delete Selected'));
	this.createBtn = element(by.partialButtonText('Create New Project'));
	this.newProjectNameInput  = element(by.model('newProject.projectName'));
	this.newProjectTypeSelect = element(by.model('newProject.appName'));
	this.saveBtn = element(by.partialButtonText('Save'));
	// Or just select "100" from the per-page dropdown, then you're pretty much guaranteed the Test Project will be on page 1, and you can find it.
	this.itemsPerPageCtrl = element(by.model('itemsPerPage'));
	this.projectsCtrl =     element(by.repeater('project in visibleProjects'));
	this.projectsList = element.all(by.repeater('project in visibleProjects'));
	this.projectNames = element.all(by.repeater('project in visibleProjects').column('{{project.projectname}}'));
	this.projectTypes = element.all(by.repeater('project in visibleProjects').column('{{project.projectname}} ({{projectTypes[project.appName]}})'));

	this.select100ItemsPerPage = function() {
		if (false) {
			// One way to do it, not ideal
			// Options are 10, 25, 50, 100. We want 100, the 4th child. (CSS counts from 1).
			// this.itemsPerPageCtrl.$('option:nth-child(4)').click();
		} else{
			// A better way to do it, which allows for other options
			util.clickDropdownByValue(this.itemsPerPageCtrl, "100");
		};
		// Either way, the following expect() should be fulfilled
		expect(element(by.selectedOption('itemsPerPage')).getText()).toEqual('100');
	};
	
	this.projectExists = function() {
		
	};

	this.findProject = function(projectName) {
		var foundRow = undefined;
		var result = protractor.promise.defer();
		var searchName = new RegExp(projectName + ' \\(' + projectTypes['sf'] + '\\)');
		this.select100ItemsPerPage(); // Ensure that the project *will* be on page 1, so we don't have to click through pagination links
		this.projectsList.map(function(row) {
			row.getText().then(function(text) {
				if (searchName.test(text)) {
					foundRow = row;
				};
			});
		}).then(function() {
			if (foundRow) {
				result.fulfill(foundRow);
			} else {
				result.reject("Project " + projectName + " not found.");
			}
		});
		return result;
	};
	this.deleteProject = function(nameToDelete) {
		var page = this; // For use inside the anonymous functions below
		this.findProject(nameToDelete).then(function(projectRow) {
			var elem = projectRow.$("input[type='checkbox']");
			elem.click();
			page.deleteBtn.click();
			// Clicking the delete button pops up an "are you sure?" alert
			var alert = browser.switchTo().alert();
			alert.accept();
		});
	};

	this.addNewProject = function(nameToAdd) {
		var page = this;
		this.createBtn.click();
		this.newProjectNameInput.sendKeys(nameToAdd);
		util.clickDropdownByValue(this.newProjectTypeSelect, projectTypes['sf']);
		this.saveBtn.click();
	};

	this.clickOnProject = function(projectName) {
		this.findProject(projectName).then(function(projectRow) {
			var link = projectRow.$('a');
			link.getAttribute('href').then(function(url) {
				browser.get(url);
			});
		});
	};
	
	this.addUserToProject = function(projectName, userName, roleText) {
		this.findProject(projectName).then(function(projectRow) {
//			var btn = projectRow.findElement(by.partialButtonText("Add me as " + roleText));
//			btn.click();
			var link = projectRow.$('a');
			link.getAttribute('href').then(function(url) {
				browser.get(url + '/settings');
				// Users tab is selected by default, so the following check might not be needed
//				var usersTab = element(by.xpath('//li[@heading="Users"]'));
//				expect(usersTab.isElementPresent()).toBeTruthy();
				var addMembersBtn = element(by.partialButtonText("Add Members"));
				var newMembersDiv = $('#newMembersDiv');
				var userNameInput = newMembersDiv.$('input[type="text"]');
				addMembersBtn.click();
				userNameInput.sendKeys(userName);
				var typeaheadDiv = $('.typeahead');
				var typeaheadItems = typeaheadDiv.$('ul li');
				typeaheadItems.click(); // Thanks to Protractor, this "just works", because it waits for Angular to settle
				var addToProjectBtn = newMembersDiv.$('button'); // This should be unique no matter what
				expect(addToProjectBtn.getText()).toContain("Add Existing User");
				addToProjectBtn.click();
				// Now set the user to member or manager, as needed
				var projectMemberRows = element.all(by.repeater('user in list.visibleUsers'));
				var foundUserRow;
				projectMemberRows.map(function(row) {
					var nameColumn = row.findElement(by.binding("{{user.username}}"));
					nameColumn.getText().then(function(text) {
						if (text === userName) {
							foundUserRow = row;
						};
					});
				}).then(function() {
					if (foundUserRow) {
						var select = foundUserRow.$('select');
						util.clickDropdownByValue(select, roleText);
					}
				});
			});
//			link.click();
//			browser.wait(function() {
//				return browser.getCurrentUrl().then(function(url) {
//					expect(url).toContain("/app/sfchecks#/p/");
//				});
//			}, 8000);
//			browser.pause();
			page.get(); // After all is finished, reload projects page
		});
	};
	this.addManagerToProject = function(projectName, userName) {
		this.addUserToProject(projectName, userName, "Manager");
	};
	this.addMemberToProject = function(projectName, userName) {
		this.addUserToProject(projectName, userName, "Member");
	};
	
	this.removeUserFromProject = function(projectName, userName) {
		this.findProject(projectName).then(function(projectRow) {
			var link = projectRow.$('a');
			link.getAttribute('href').then(function(url) {
				browser.get(url + '/settings');
				var userFilter = element(by.model('userFilter'));
				userFilter.sendKeys(userName);
				var projectMemberRows = element.all(by.repeater('user in list.visibleUsers'));
				var foundUserRow = projectMemberRows.first();
				var rowCheckbox = foundUserRow.$('input[type="checkbox"]');
				util.setCheckbox(rowCheckbox, true);
				var removeMembersBtn = element(by.partialButtonText("Remove Members"));
				removeMembersBtn.click();
			});
			page.get(); // After all is finished, reload projects page
		});
	};
};

module.exports = new SfProjectsPage();
