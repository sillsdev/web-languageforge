'use strict';

afterEach(function() {
	var appFrame = require('../../pages/appFrame.js');
	//browser.ignoreSyncronization = true;
	expect(appFrame.errorMessage.isPresent()).toBe(false);
	//browser.ignoreSyncronization = false;
});