'use strict';

var appFrame 	= require('../../bellows/pages/appFrame.js');
var body 		= require('../../bellows/pages/pageBody.js');
afterEach(function() {
	//browser.ignoreSyncronization = true;
	expect(appFrame.errorMessage.isPresent()).toBe(false);
	expect(body.phpError.isPresent()).toBe(false);
	//browser.ignoreSyncronization = false;
});