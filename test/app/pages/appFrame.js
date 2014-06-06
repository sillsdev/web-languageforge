'use strict';

var SfAppFrame = function() {
	
	// TODO: this will likely change when we refactor the display of notifications - cjh 2014-06
	this.errorMessage = element(by.css('.alert-error'));
};

module.exports = new SfAppFrame();