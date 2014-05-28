'use strict';

describe('the questions list page AKA the text page', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var textPage = require('../../../pages/textPage.js');
	var loginPage = require('../../../pages/loginPage.js');
	var util = require('../../../pages/util.js');
	var constants = require('../../../../testConstants.json');

	describe('normal user', function() {
		it('setup: login as normal user', function() {
			loginPage.loginAsMember();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
		});

		it('should list questions, with answer counts and responses for each question', function() {
			// Setup script creates two questions. Since we can't count on them being in specific positions
			// as that might be modified by other tests that add questions, we'll search for them.
			util.findRowByText(textPage.questionRows, constants.testText1Question1Title).then(function(row) {
				expect("undefined" == typeof row).toBeFalsy(); // This seems to be the best way to check that the row exists
				var answerCount = row.findElement(by.binding('{{getAnswerCount(question)}}'));
				var responseCount = row.findElement(by.binding('{{getResponses(question)}}'));
				expect(answerCount.getText()).toBe('1');
				expect(responseCount.getText()).toBe('2 responses');
			});
			util.findRowByText(textPage.questionRows, constants.testText1Question2Title).then(function(row) {
				expect("undefined" == typeof row).toBeFalsy(); // This seems to be the best way to check that the row exists
				var answerCount = row.findElement(By.binding('{{getAnswerCount(question)}}'));
				var responseCount = row.findElement(By.binding('{{getResponses(question)}}'));
				expect(answerCount.getText()).toBe('1');
				expect(responseCount.getText()).toBe('2 responses');
			});
		});

		it('a normal user cannot add new questions', function() {
			expect(textPage.addNewBtn.isDisplayed()).toBeFalsy();
		});

		it('a normal user cannot delete questions', function() {
			expect(textPage.deleteBtn.isDisplayed()).toBeFalsy();
		});

		it('a normal user cannot create templates', function() {
			expect(textPage.makeTemplateBtn.isDisplayed()).toBeFalsy();
		});

		it('a normal user cannot edit text settings', function() {
			// The text settings button should not even exist on the page for a normal user
			expect(textPage.textSettingsBtn.isPresent()).toBeFalsy();
			//expect(textPage.textSettingsBtn.isDisplayed()).toBeFalsy();
		});
	});

	describe('project manager', function() {
		it('setup: login as manager', function() {
			loginPage.loginAsManager();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
		});

		it('a project manager can add new questions', function() {
			expect(textPage.addNewBtn.isDisplayed()).toBeTruthy();
		});

		it('a project manager can delete questions', function() {
			expect(textPage.deleteBtn.isDisplayed()).toBeTruthy();
		});

		it('a project manager can create templates', function() {
			expect(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
		});

		it('a project manager can edit text settings', function() {
			// The text settings button should both exist and be displayed for a manager
			expect(textPage.textSettingsBtn.isPresent()).toBeTruthy(); // Why falsy? Shouldn't it be truthy?
			expect(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
		});
	});

	describe('site admin', function() {
		it('setup: login as admin', function() {
			loginPage.loginAsAdmin();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
		});

		it('a site admin can add new questions', function() {
			expect(textPage.addNewBtn.isDisplayed()).toBeTruthy();
		});

		it('a site admin can delete questions', function() {
			expect(textPage.deleteBtn.isDisplayed()).toBeTruthy();
		});

		it('a site admin can create templates', function() {
			expect(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
		});

		it('a site admin can edit text settings', function() {
			// The text settings button should both exist and be displayed for a site admin
			expect(textPage.textSettingsBtn.isPresent()).toBeTruthy();
			expect(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
		});
	});
});