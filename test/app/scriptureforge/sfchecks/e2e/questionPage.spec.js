'use strict';

describe('the question page', function() {
	var constants 			= require('../../../testConstants.json');
	var loginPage 			= require('../../../bellows/pages/loginPage.js');
	var util 				= require('../../../bellows/pages/util.js');
	var projectListPage 	= require('../../../bellows/pages/projectsPage.js');
	var projectPage 		= require('../pages/projectPage.js');
	var textPage 			= require('../pages/textPage.js');
	var textSettingsPage 	= require('../pages/textSettingsPage.js');
	var page 				= require('../pages/questionPage.js');

	describe('a normal user', function() {

		it('setup: login as normal user', function() {
			loginPage.loginAsMember();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
			textPage.questionLink(constants.testText1Question1Title).click();
		});

		it('cannot edit question settings - NYI', function() {
		});

		it('cannot edit comment - NYI', function() {
		});

		it('cannot delete comment - NYI', function() {
		});

		it('cannot tag answer - NYI', function() {
		});

		it('cannot edit answer - NYI', function() {
		});

		it('cannot delete answer - NYI', function() {
		});

		it('cannot flag answer for export', function() {
			expect(page.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
			expect(page.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
		});

	});

	describe('a project manager', function() {
		
		it('setup: login as manager', function() {
			loginPage.loginAsManager();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
			textPage.questionLink(constants.testText1Question1Title).click();
		});

		it('can edit question settings - NYI', function() {
		});

		it('can edit comment - NYI', function() {
		});

		it('can delete comment - NYI', function() {
		});

		it('can tag answer - NYI', function() {
		});

		it('can edit answer - NYI', function() {
		});

		it('can delete answer - NYI', function() {
		});

		it('can flag answer for export', function() {
			expect(page.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
			expect(page.answers.flags.lastButtonClear().isDisplayed()).toBe(true);
			page.answers.flags.lastButtonClear().click();
			expect(page.answers.flags.lastButtonSet().isDisplayed()).toBe(true);
			expect(page.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
		});

		describe('paratext export of flagged answer', function() {

			it('setup: back to Text, click settings, click on tab', function() {
				browser.navigate().back();		// TODO change to use breadcrumb text link (back has indeterminant finish) IJH 2014-06
				textPage.textSettingsBtn.click();
				textSettingsPage.tabs.paratextExport.click();
			});
			
			it('can prepare export for answers flagged for export without comments', function() {
				expect(textSettingsPage.paratextExportTab.exportAnswers.getAttribute('checked')).toBeTruthy;
				expect(textSettingsPage.paratextExportTab.exportComments.getAttribute('checked')).toBeFalsy();
				expect(textSettingsPage.paratextExportTab.exportFlagged.getAttribute('checked')).toBeTruthy;
				expect(textSettingsPage.paratextExportTab.prepareButton.isPresent()).toBe(true);
				textSettingsPage.paratextExportTab.prepareButton.click();
				expect(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
				expect(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual("1 answer(s)");
				expect(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(false);
				expect(textSettingsPage.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
			});
			
			it('can prepare export for answers flagged for export with comments', function() {
				textSettingsPage.paratextExportTab.exportComments.click();
				textSettingsPage.paratextExportTab.prepareButton.click();
				expect(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
				expect(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual("1 answer(s)");
				expect(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(true);
				expect(textSettingsPage.paratextExportTab.commentCount.getText()).toEqual("1 comment(s)");
				expect(textSettingsPage.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
			});
			
		});
		
	});

	describe('a system admin', function() {
		it('setup: login as admin', function() {
			loginPage.loginAsAdmin();
			projectListPage.get();
			projectListPage.clickOnProject(constants.testProjectName);
			projectPage.textLink(constants.testText1Title).click();
			textPage.questionLink(constants.testText1Question1Title).click();
		});

		it('can edit question settings - NYI', function() {
		});

		it('can edit comment - NYI', function() {
		});

		it('can delete comment - NYI', function() {
		});

		it('can tag answer - NYI', function() {
		});

		it('can edit answer - NYI', function() {
		});

		it('can delete answer - NYI', function() {
		});

		it('can flag answer for export', function() {
			expect(page.answers.flags.lastButtonSet().isDisplayed()).toBe(true);
			expect(page.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
			page.answers.flags.lastButtonSet().click();
			expect(page.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
			expect(page.answers.flags.lastButtonClear().isDisplayed()).toBe(true);
		});

	});
	
});
