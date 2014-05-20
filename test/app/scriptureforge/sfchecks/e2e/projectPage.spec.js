'use strict';

describe('the project dashboard AKA text list page', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var loginPage = require('../../../pages/loginPage.js');
	
	projectListPage.setup.makeSampleProject();

	it('can create a new text', function() {});
	
	it('lists existing texts', function() {});
	
	it('can click through to the questions page', function() {});
	
	it('can click through to the settings page', function() {});
	
	// TODO: how do we clean up the test data??? - cjh
	
	
    it('can click on a text', function() {
    	loginPage.loginAsUser();
    	//loginPage.login('chris', '0JvbuHNYQrvib3n0iNls');
    	projectsListPage.get();
    	
    	projectsListPage.setup.makeSampleProject

    	var firstTextName = projectPage.textNames.first().getText();
    	arguments.})
    	projectPage.clickOnText(firstTextName);
    	browser.pause();
    });

});
