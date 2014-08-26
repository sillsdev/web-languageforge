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
	
	this.old_findEntryByLexeme = function(lexeme) {
		var foundRow = undefined;
		var result = protractor.promise.defer();
		var re = new RegExp(lexeme);
		page.entriesList.map(function(row) {
			row.element(by.binding('entry.word')).getText().then(function(word) {
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
	this.old_clickEntryByLexeme = function(lexeme) {
		page.old_findEntryByLexeme().then(function(row) {
			row.click();
		});
	};
	this.better_findEntryByLexeme = function(lexeme) {
		return page.entriesList.filter(function(row) {
			return row.element(by.binding('entry.word')).getText().then(function(word) {
				return (word == lexeme);
			});
		});
	};
	this.better_clickEntryByLexeme = function(lexeme) {
		page.better_findEntryByLexeme(lexeme).then(function(matched_rows) {
			matched_rows[0].click();
		});
	};
	this.findEntryByLexeme = this.better_findEntryByLexeme;
	this.clickEntryByLexeme = this.better_clickEntryByLexeme;
};

module.exports = new LfDbePage();
