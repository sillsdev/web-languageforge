'use strict';

describe('exercise the projectPage object', function() {
	var projectPage = require('../../../pages/projectPage.js');
	var loginPage = require('../../../pages/loginPage.js');
	loginPage = new loginPage();

    it('can click on a text', function() {
    	loginPage.login('chris', '0JvbuHNYQrvib3n0iNls');
    	projectPage.get('51fa387956dd85d1714e0ff8');
    	var firstTextName = projectPage.textNames.first().getText();
    	projectPage.clickOnText(firstTextName);
    	browser.pause();
    });

});
