'use strict';

describe('the project dashboard AKA text list page - normal user', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var loginPage = require('../../../pages/loginPage.js');
	var constants = require('../../../../testConstants.json');
	
	it('setup: logout, login as project member, go to project dashboard', function() {
		loginPage.logout();
		loginPage.loginAsMember();
    	projectListPage.get();
    	projectListPage.clickOnProject(constants.testProjectName);
	});
	
	it('lists existing texts', function() {
		expect(projectPage.textNames.count()).toBeGreaterThan(1);
	});
	
	
	it('can create a new text', function() {});
	
	
	it('can click through to a questions page', function() {});
	
	it('can click through to the settings page', function() {});
	
	/*
    it('can click on a text', function() {
    	loginPage.loginAsUser();
    	//loginPage.login('chris', '0JvbuHNYQrvib3n0iNls');
    	
    	projectsListPage.setup.makeSampleProject

    	var firstTextName = projectPage.textNames.first().getText();
    	arguments.})
    	projectPage.clickOnText(firstTextName);
    	browser.pause();
    });
    */

});
