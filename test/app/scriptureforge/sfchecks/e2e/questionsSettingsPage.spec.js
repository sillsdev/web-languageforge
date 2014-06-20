'use strict';

afterEach(function() {
	var appFrame = require('../../../pages/appFrame.js');
	expect(appFrame.errorMessage.isPresent()).toBe(false);
});

describe('the project settings page - project manager', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var textPage = require('../../../pages/textPage.js');
	var page = require('../../../pages/textSettingsPage.js');
	var header = require('../../../pages/pageHeader.js');
	var loginPage = require('../../../pages/loginPage.js');
	var util = require('../../../pages/util.js');
	var constants = require('../../../../testConstants.json');
	
	it('setup: logout, login as project manager, go to text settings', function() {
		loginPage.logout();
		loginPage.loginAsManager();
    	projectListPage.get();
    	projectListPage.clickOnProject(constants.testProjectName);
		projectPage.textLink(constants.testText1Title).click();
		textPage.textSettingsBtn.click();
	});
	
	// The Edit Text tab is tested as part of a process in the Text (Questions) page tests. IJH 2014-06
	// TODO refactor to bring Edit Text test in here. IJH 2014-06

	// The Archived Questions tab is tested as part of a process in the Text (Questions) page tests. IJH 2014-06
	
	describe('audio file tab - NYI', function() {
	});

	describe('paratext export tab', function() {

		it('setup: click on tab', function() {
			expect(page.tabs.paratextExport.isPresent()).toBe(true);
			page.tabs.paratextExport.click();
		});
		
		it('get a message since there are not messages flagged for export', function() {
			expect(page.paratextExportTab.exportAnswers.getAttribute('checked')).toBeTruthy;
			expect(page.paratextExportTab.exportComments.getAttribute('checked')).toBeFalsy();
			expect(page.paratextExportTab.exportFlagged.getAttribute('checked')).toBeTruthy;
			expect(page.paratextExportTab.downloadButton.isDisplayed()).toBe(false);
			expect(page.paratextExportTab.prepareButton.isPresent()).toBe(true);
			page.paratextExportTab.prepareButton.click();
			expect(page.paratextExportTab.noExportMsg.isDisplayed()).toBe(true);
		});

		it('can prepare export for all answers without comments', function() {
			page.paratextExportTab.exportFlagged.click();
			page.paratextExportTab.prepareButton.click();
			expect(page.paratextExportTab.answerCount.isDisplayed()).toBe(true);
			expect(page.paratextExportTab.answerCount.getText()).toEqual("2 answer(s)");
			expect(page.paratextExportTab.commentCount.isDisplayed()).toBe(false);
			expect(page.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
		});
		
		it('can prepare export for all answers with comments', function() {
			page.paratextExportTab.exportComments.click();
			page.paratextExportTab.prepareButton.click();
			expect(page.paratextExportTab.answerCount.isDisplayed()).toBe(true);
			expect(page.paratextExportTab.answerCount.getText()).toEqual("2 answer(s)");
			expect(page.paratextExportTab.commentCount.isDisplayed()).toBe(true);
			expect(page.paratextExportTab.commentCount.getText()).toEqual("2 comment(s)");
			expect(page.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
		});
		
	});

});
