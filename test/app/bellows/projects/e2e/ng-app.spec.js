'use strict';

var util = require('../../../pages/util.js');
var loginPage = require('../../../pages/loginPage.js');
var projectsPage = require('../../../pages/projectsPage.js');
var constants = require('../../../../testConstants.json');

describe('E2E Projects List App - Normal User', function() {
	
	// environment for test
	/*
	var testEnvironment = require();
	
	testEnvironment.ensureNormalUserExists();
	testEnvironment.makeProjectIfNecessary('project1');
	testEnvironment.makeProjectIfNecessary('project2');
	testEnvironment.ensureNormalUserIsProjectMember('project1');
	*/
	
	
	it('should list the project of which the user is a member', function() {
		
	});
	
	it('should not list projects the user is not a member of', function() {
		
	});
	
	it('can list two projects of which the user is a member', function() {
		
	});
});

// Two helper functions to avoid duplicating the same checks in admin test below
var expectProjectToBeLinked = function(projectRow) {
	var inLink = projectRow.$('li > a > span');
	var notInLink = projectRow.$('li > span');
	expect(inLink.isDisplayed()).toBeTruthy();
	expect(notInLink.isDisplayed()).toBeFalsy();
};
var expectProjectNotToBeLinked = function(projectRow) {
	var inLink = projectRow.$('li > a > span');
	var notInLink = projectRow.$('li > span');
	expect(inLink.isDisplayed()).toBeFalsy();
	expect(notInLink.isDisplayed()).toBeTruthy();
};

describe('E2E Projects List App - Site Admin User', function() {

	it('should list all projects for ScriptureForge', function() {
		loginPage.loginAsAdmin();
		projectsPage.get();
		expect(projectsPage.projectsList.count()).toBeGreaterThan(0);
		// Check that the test project is around
		projectsPage.findProject(constants.testProjectName).then(expectProjectToBeLinked);
	});

	it('should show add and delete buttons', function() {
//		projectsPage.createBtn.getOuterHtml().then(console.log);
//		projectsPage.deleteBtn.getOuterHtml().then(console.log);
		expect(projectsPage.createBtn.isDisplayed()).toBeTruthy();
		expect(projectsPage.deleteBtn.isDisplayed()).toBeTruthy();
	});

	it('should disable the delete button when no projects are selected', function() {
		expect(projectsPage.deleteBtn.isEnabled()).toBeFalsy();
	});

	it('should enable the delete button when at least one project is selected', function() {
		projectsPage.findProject(constants.testProjectName).then(function(projectRow) {
			var checkbox = projectRow.$('input[type="checkbox"]');
			util.setCheckbox(checkbox, true);
			expect(projectsPage.deleteBtn.isEnabled()).toBeTruthy();
			util.setCheckbox(checkbox, false); // Just in case, let's be on the safe side
		});
	});

	it('should allow the admin to add themselves to the project as member or manager', function() {
		// First remove the admin from the project
		loginPage.loginAsManager();
		projectsPage.get();
		// The admin should not see "Add myself to project" buttons when he's already a project member or manager
		// And the project name should be a clickable link
		projectsPage.findProject(constants.testProjectName).then(function(projectRow) {
			expectProjectToBeLinked(projectRow);
			var addAsManagerBtn = projectRow.findElement(by.partialButtonText("Add me as Manager"));
			var addAsMemberBtn = projectRow.findElement(by.partialButtonText("Add me as Member"));
			expect(addAsManagerBtn.isDisplayed()).toBeFalsy();
			expect(addAsMemberBtn.isDisplayed()).toBeFalsy();
		});
		projectsPage.removeUserFromProject(constants.testProjectName, constants.adminUsername);
		loginPage.loginAsAdmin();
		projectsPage.get();
		// Now the admin should have "Add myself to project" buttons
		// And the project name should NOT be a clickable link
		projectsPage.findProject(constants.testProjectName).then(function(projectRow) {
			expectProjectNotToBeLinked(projectRow);
			var addAsManagerBtn = projectRow.findElement(by.partialButtonText("Add me as Manager"));
			var addAsMemberBtn = projectRow.findElement(by.partialButtonText("Add me as Member"));
			expect(addAsManagerBtn.isDisplayed()).toBeTruthy();
			expect(addAsMemberBtn.isDisplayed()).toBeTruthy();
			// Now add the admin back to the project
			addAsManagerBtn.click();
		});
		// And the buttons should go away after one of them is clicked
		projectsPage.findProject(constants.testProjectName).then(function(projectRow) {
			expectProjectToBeLinked(projectRow);
			var addAsManagerBtn = projectRow.findElement(by.partialButtonText("Add me as Manager"));
			var addAsMemberBtn = projectRow.findElement(by.partialButtonText("Add me as Member"));
			expect(addAsManagerBtn.isDisplayed()).toBeFalsy();
			expect(addAsMemberBtn.isDisplayed()).toBeFalsy();
		});
	});
});