'use strict';

describe('the questions list page AKA the text page', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var textPage = require('../../../pages/textPage.js');
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

		it('cannot add new questions', function() {
			expect(textPage.addNewBtn.isDisplayed()).toBeFalsy();
		});

		it('cannot delete questions', function() {
			expect(textPage.deleteBtn.isDisplayed()).toBeFalsy();
		});

		it('cannot create templates', function() {
			expect(textPage.makeTemplateBtn.isDisplayed()).toBeFalsy();
		});

		it('cannot edit text settings', function() {
			// The text settings button should not even exist on the page for a normal user
			expect(textPage.textSettingsBtn.isPresent()).toBeFalsy();
			//expect(textPage.textSettingsBtn.isDisplayed()).toBeFalsy();
		});
	});

	describe('a project manager', function() {
		it('setup: login as manager', function() {
			loginPage.loginAsManager();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
		});

		it('can add new questions', function() {
			expect(textPage.addNewBtn.isDisplayed()).toBeTruthy();
		});

		it('can delete questions', function() {
			expect(textPage.deleteBtn.isDisplayed()).toBeTruthy();
		});

		it('can create templates', function() {
			expect(textPage.makeTemplateBtn.isDisplayed()).toBeTruthy();
		});

		it('can edit text settings', function() {
			// The text settings button should both exist and be displayed for a manager
			expect(textPage.textSettingsBtn.isPresent()).toBeTruthy(); // Why falsy? Shouldn't it be truthy?
			expect(textPage.textSettingsBtn.isDisplayed()).toBeTruthy();
		});

		it('can edit text content', function() {
			textPage.textSettingsBtn.click();
			// TODO: Use actual USX from projectPage.testData (maybe move it to testConstants) for this test, then verify it shows up properly on the question page
			var letMeEditCheckbox = element(by.model('editedText.editPreviousText'));
			var contentEditor = element(by.model('editedText.content'));
			contentEditor.sendKeys('Hello, world!');
			util.setCheckbox(letMeEditCheckbox, true);
			// Should pop up two alerts in a row
			// First alert: "This is dangerous, are you sure?"
			util.waitForAlert();
			var alert = browser.switchTo().alert();
			alert.accept();
			// Second alert: "You have previous edits which will be replaced, are you really sure?"
			util.waitForAlert();
			alert = browser.switchTo().alert();
			alert.accept();
			// TODO: Check alert text for one or both alerts (see http://stackoverflow.com/a/19884387/2314532)
			expect(contentEditor.getAttribute('value')).toBe(constants.testText1Content);
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
			expect(textPage.deleteBtn.isDisplayed()).toBeTruthy();
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
