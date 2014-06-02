'use strict';

describe('the project dashboard AKA text list page', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var questionListPage = require('../../../pages/textPage.js');
	var loginPage = require('../../../pages/loginPage.js');
	var util = require('../../../pages/util.js');
	var constants = require('../../../../testConstants.json');
	
	describe('project member/user', function() {
		it('setup: logout, login as project member, go to project dashboard', function() {
			loginPage.logout();
			loginPage.loginAsMember();
	    	projectListPage.get();
	    	projectListPage.clickOnProject(constants.testProjectName);
		});

		it('lists existing texts', function() {
			expect(projectPage.textNames.count()).toBeGreaterThan(1);
		});
		
		it('can click through to a questions page', function() {
			projectPage.textLink(constants.testText1Title).click();
			expect(questionListPage.questionNames.count()).toBeGreaterThan(0);
			browser.navigate().back();
		});

		it('cannot click on settings', function() {
			expect(projectPage.settingsButton.isDisplayed()).toBe(false);
		});

	});

	describe('project manager', function() {
		var sampleTitle = '111textTitle12345';
		it('setup: logout, login as project manager, go to project dashboard', function() {
			loginPage.logout();
			loginPage.loginAsManager();
	    	projectListPage.get();
	    	projectListPage.clickOnProject(constants.testProjectName);
		});

		it('can click on settings button', function() {
			expect(projectPage.settingsButton.isDisplayed()).toBe(true);
			projectPage.settingsButton.click();
			browser.navigate().back();
		});

		it('lists existing texts', function() {
			expect(projectPage.textNames.count()).toBeGreaterThan(1);
		});

		it('can click through to a questions page', function() {
			projectPage.textLink(constants.testText1Title).click();
			expect(questionListPage.questionNames.count()).toBeGreaterThan(0);
			browser.navigate().back();
		});
		
		it('can create a new text (input text area)', function() {
			expect(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
			projectPage.newText.showFormButton.click();
			projectPage.newText.title.sendKeys(sampleTitle);
			projectPage.newText.usx.sendKeys(projectPage.testData.simpleUsx1);
			projectPage.newText.saveButton.click();
			expect(projectPage.textLink(sampleTitle).isDisplayed()).toBe(true);
		});
		
		it('can click through to newly created text', function() {
			projectPage.textLink(sampleTitle).click();
			browser.navigate().back();
		});
		
		it('can delete the text that was just created', function() {
			var deleteButton = projectPage.removeTextButton.find();
			expect(deleteButton.isDisplayed()).toBe(true);
			expect(deleteButton.isEnabled()).toBe(false);
			util.setCheckbox(projectPage.getFirstCheckbox(), true);
			expect(deleteButton.isEnabled()).toBe(true);
			deleteButton.click();
			browser.switchTo().alert().accept();
			expect(deleteButton.isEnabled()).toBe(false);
			expect(projectPage.textLink(sampleTitle).isPresent()).toBe(false);
		});

		// I am avoiding testing creating a new text using the file dialog for importing a USX file... - cjh
		// according to http://stackoverflow.com/questions/8851051/selenium-webdriver-and-browsers-select-file-dialog
		// you can have selenium interact with the file dialog by sending keystrokes but this is highly OS dependent
		//it('can create a new text (file dialog)', function() {});
		
		it('can use the chapter trimmer to trim the USX when creating a new text', function() {
			expect(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
			projectPage.newText.showFormButton.click();
			projectPage.newText.title.sendKeys(sampleTitle);
			util.sendText(projectPage.newText.usx, projectPage.testData.longUsx1);
			projectPage.newText.fromChapter.sendKeys('1');
			projectPage.newText.fromVerse.sendKeys('1');
			projectPage.newText.toChapter.sendKeys('1');
			projectPage.newText.toVerse.sendKeys('3');
			projectPage.newText.saveButton.click();
			expect(projectPage.textLink(sampleTitle).isDisplayed()).toBe(true);
			projectPage.textLink(sampleTitle).click();
			expect(questionListPage.textContent.getText()).not.toMatch('/Cana of Galilee/');
			browser.navigate().back();

			// clean up the text
			util.setCheckbox(projectPage.getFirstCheckbox(), true);
			var deleteButton = projectPage.removeTextButton.find();
			deleteButton.click();
			browser.switchTo().alert().accept();

		});
	});
});
