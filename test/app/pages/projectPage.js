'use strict';

var SfProjectPage = function() {
	this.urlprefix = '/app/sfchecks';

	this.get = function(projectId) {
		browser.get(this.urlprefix + '#/p/' + projectId);
	};
	
	this.clickOnText = function(textTitle) {
		element(by.linkText(textTitle)).click();
	};
	
	this.textNames = element.all(by.repeater('text in visibleTexts').column('title'));
	
};

module.exports = new SfProjectPage();