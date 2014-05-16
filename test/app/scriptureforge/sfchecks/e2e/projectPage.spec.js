'use strict';

describe('exercise the projectPage object', function() {
	var projectListPage = require('../../../pages/projectsPage.js');
	var projectPage = require('../../../pages/projectPage.js');
	var loginPage = require('../../../pages/loginPage.js');

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
