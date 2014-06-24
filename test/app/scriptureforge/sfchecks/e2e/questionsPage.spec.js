'use strict';

describe('the questions list page (AKA the text page)', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var textPage = require('../../../pages/textPage.js');
	var textSettingsPage = require('../../../pages/textSettingsPage.js');
	var loginPage = require('../../../pages/loginPage.js');
	var util = require('../../../pages/util.js');
	var constants = require('../../../../testConstants.json');

	describe('a normal user', function() {

		it('setup: login as normal user', function() {
			loginPage.loginAsMember();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
		});

		it('can see questions, with answer counts and responses for each question', function() {
			// Setup script creates two questions. Since we can't count on them being in specific positions
			// as that might be modified by other tests that add questions, we'll search for them.
			util.findRowByText(textPage.questionRows, constants.testText1Question1Title).then(function(row) {
				expect("undefined" == typeof row).toBeFalsy(); // This seems to be the best way to check that the row exists
				var answerCount = row.findElement(by.binding('question.answerCount'));
				var responseCount = row.findElement(by.binding('question.responseCount'));
				expect(answerCount.getText()).toBe('1 answers');
				expect(responseCount.getText()).toBe('2 responses');
			});
			util.findRowByText(textPage.questionRows, constants.testText1Question2Title).then(function(row) {
				expect("undefined" == typeof row).toBeFalsy(); // This seems to be the best way to check that the row exists
				var answerCount = row.findElement(By.binding('question.answerCount'));
				var responseCount = row.findElement(By.binding('question.responseCount'));
				expect(answerCount.getText()).toBe('1 answers');
				expect(responseCount.getText()).toBe('2 responses');
			});
		});

		it('cannot archive questions', function() {
			expect(textPage.archiveButton.isDisplayed()).toBeFalsy();
		});

		it('cannot create templates', function() {
			expect(textPage.makeTemplateBtn.isDisplayed()).toBeFalsy();
		});

		it('cannot add new questions', function() {
			expect(textPage.addNewBtn.isDisplayed()).toBeFalsy();
		});

		it('cannot edit text settings', function() {
			expect(textPage.textSettingsBtn.isDisplayed()).toBeFalsy();
		});
	});

	describe('a project manager', function() {
		var questionTitle = '111TestQTitle1234';
		var questionDesc = '111TestQDesc1234';
		
		it('setup: login as manager', function() {
			loginPage.loginAsManager();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
		});

		it('can add new questions', function() {
			expect(textPage.addNewBtn.isDisplayed()).toBeTruthy();
			textPage.addNewQuestion(questionDesc, questionTitle);
			expect(textPage.questionLink(questionTitle).isDisplayed()).toBe(true);
		});

		it('can click through to newly created question', function() {
			textPage.questionLink(questionTitle).click();
			browser.navigate().back();
		});
		
		it('can archive the question that was just created', function() {
			var archiveButton = textPage.archiveButton.find();
			expect(archiveButton.isDisplayed()).toBe(true);
			expect(archiveButton.isEnabled()).toBe(false);
			util.setCheckbox(textPage.getFirstCheckbox(), true);
			expect(archiveButton.isEnabled()).toBe(true);
			archiveButton.click();
			util.clickModalButton('Archive');
			expect(archiveButton.isEnabled()).toBe(false);
			expect(textPage.questionLink(questionTitle).isPresent()).toBe(false);
		});

		it('can re-publish the question that was just archived (Text Settings)', function() {
			textPage.textSettingsBtn.click();
			textSettingsPage.tabs.archiveQuestions.click();
			expect(textSettingsPage.archivedQuestionsTab.questionLink(questionTitle).isDisplayed()).toBe(true);
			var publishButton = textSettingsPage.archivedQuestionsTab.publishButton.find();
			expect(publishButton.isDisplayed()).toBe(true);
			expect(publishButton.isEnabled()).toBe(false);
			util.setCheckbox(textSettingsPage.archivedQuestionsTabGetFirstCheckbox(), true);
			expect(publishButton.isEnabled()).toBe(true);
			publishButton.click();
			expect(textSettingsPage.archivedQuestionsTab.questionLink(questionTitle).isPresent()).toBe(false);
			expect(publishButton.isEnabled()).toBe(false);
			browser.navigate().back();
			expect(textPage.questionLink(questionTitle).isDisplayed()).toBe(true);
		});
		
		it('can delete questions', function() {
			expect(textPage.archiveButton.isDisplayed()).toBeTruthy();
		});

		it('can create templates', function() {
			expect(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
		});

		it('can edit text settings', function() {
			// The text settings button should both exist and be displayed for a manager
			expect(textPage.textSettingsBtn.isPresent()).toBeTruthy();
			expect(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
		});

	});

	describe('a site admin', function() {
		it('setup: login as admin', function() {
			loginPage.loginAsAdmin();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
		});

		it('can add new questions', function() {
			expect(textPage.addNewBtn.isDisplayed()).toBeTruthy();
		});

		it('can delete questions', function() {
			expect(textPage.archiveButton.isDisplayed()).toBeTruthy();
		});

		it('can create templates', function() {
			expect(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
		});

		it('can edit text settings', function() {
			// The text settings button should both exist and be displayed for a site admin
			expect(textPage.textSettingsBtn.isPresent()).toBeTruthy();
			expect(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
		});
		
	});
	
});
