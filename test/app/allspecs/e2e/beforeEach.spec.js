'use strict';

afterEach(function() {
	var appFrame = require('../../pages/appFrame.js');
	expect(appFrame.errorMessage.isPresent()).toBe(false);
});