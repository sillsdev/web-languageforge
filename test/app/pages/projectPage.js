'use strict';

var SfProjectPage = function() {
	this.urlprefix = '/app/sfchecks';

	this.get = function(projectId) {
		browser.get(this.urlprefix + '#/p/' + projectId);
	};
	
	this.clickOnText = function(textTitle) {
		var targetElement;
		this.textList.map(function(row) {
			//row.then(console.log);
			row.findElement(by.binding('text.title')).getText().then(function(title) {
				if (textTitle == title) {
					//targetElement = row.findElement(by.binding('text.url'));
					row.findElements(by.tagName('a')).then(function(elements) {
						targetElement = elements[0];
					});
				}
			});
		}).then(function() {
			targetElement.click();
			browser.pause();
		});
	};
	this.textList = element.all(by.repeater('text in visibleTexts'));
};

module.exports = new SfProjectPage();