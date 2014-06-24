'use strict';

var appFrame = require('../../pages/appFrame.js');
var body = require('../../pages/pageBody.js');
afterEach(function() {
	//browser.ignoreSyncronization = true;
	expect(appFrame.errorMessage.isPresent()).toBe(false);
	expect(body.phpError.isPresent()).toBe(false);
	//browser.ignoreSyncronization = false;
});