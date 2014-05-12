'use strict';

var projectTypes = {
	'sf': 'Community Scripture Checking', // ScriptureForge
	'lf': 'Web Dictionary', // LanguageForge
};

var findDropdownByValue = function(dropdownElement, value) {
	// Returns a promise that will resolve to the <option> with the given value (as returned by optionElement.getText())
	var result = protractor.promise.defer();
	var options = dropdownElement.$$('option');
	options.map(function(elem) {
		elem.getText().then(function(text) {
			if (text === value) {
				result.fulfill(elem);
			}
		});
	});
	return result;
};

var clickDropdownByValue = function(dropdownElement, value) {
	// Select an element of the dropdown based on its value (its text)
	var option = findDropdownByValue(dropdownElement, value);
	option.then(function(elem) {
		elem.click();
	});
};

var SfProjectsPage = function() {
	var page = this;
	this.url = "/app/projects";
	this.get = function() {
		browser.get(this.url);
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
			clickDropdownByValue(this.itemsPerPageCtrl, "100");
		};
		// Either way, the following expect() should be fulfilled
		expect(element(by.selectedOption('itemsPerPage')).getText()).toEqual('100');
	};

	this.deleteProject = function(nameToDelete) {
		var searchName = new RegExp(nameToDelete + ' \\(' + projectTypes['sf'] + '\\)');
		var page = this; // For use inside the anonymous functions below
		this.select100ItemsPerPage(); // Ensure that the project *will* be on page 1, so we don't have to click through pagination links
		var foundRow = undefined;
		this.projectsList.map(function(row) {
			row.getText().then(function(text) {
				if (searchName.test(text)) {
					foundRow = row;
				};
			});
		}).then(function() {
			// The .then() call is very important; it ensures that foundRow will be defined
			// by the time we use it (if, of course, the project was found).
			if (typeof foundRow === "undefined") {
				// Project not found, so don't delete anything
			} else {
				var elem = foundRow.$("input[type='checkbox']");
				elem.click();
				page.deleteBtn.click();
				// Clicking the delete button pops up an "are you sure?" alert
				var alert = browser.switchTo().alert();
				alert.accept();
			};
		});
	};

	this.addProject = function(nameToAdd) {
		var page = this;
		this.createBtn.click();
		this.newProjectNameInput.sendKeys(nameToAdd);
		clickDropdownByValue(this.newProjectTypeSelect, projectTypes['sf']);
		this.saveBtn.click();
	}
};

module.exports = SfProjectsPage;