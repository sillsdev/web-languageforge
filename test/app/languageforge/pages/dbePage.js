'use strict';

var projectTypes = {
	'sf': 'Community Scripture Checking', // ScriptureForge
	'lf': 'Web Dictionary', // LanguageForge
};

var util = require('../../bellows/pages/util');  // TODO: Remove if not used once page implemented

var LfDbePage = function() {
	var page = this;
	this.url = "/app/lexicon";
	this.get = function(projectId) {
		var extra = projectId ? ("/" + projectId) : "";
		browser.get(browser.baseUrl + this.url + extra);
	};

	this.newWordBtn = element(by.partialButtonText('New Word'));
	this.entriesList = element.all(by.repeater('entry in show.entries'));
	
	this.findEntryByLexeme = function(lexeme) {
		var foundRow = undefined;
		var result = protractor.promise.defer();
		var re = new RegExp(lexeme);
		this.entriesList.map(function(row) {
			row.findElement(by.binding('entry.word')).getText().then(function(word) {
				if (re.test(word)) {
					foundRow = row;
				};
			});
		}).then(function() {
			if (foundRow) {
				result.fulfill(foundRow);
			} else {
				result.reject("Entry \"" + lexeme + "\" not found.");
			}
		});
		return result;
	};
	this.clickEntryByLexeme = function(lexeme) {
		this.findEntryByLexeme().then(function(row) {
			row.click();
		});
	}
};

module.exports = new LfDbePage();
