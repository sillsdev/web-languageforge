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
		browser.get(browser.baseUrl + page.url + extra);
	};
	
	this.browseDiv  = $('#lexAppListView');
	this.editDiv    = $('#lexAppEditView');
	this.commentDiv = $('#lexAppCommentView');

	// --- Browse view ---
	this.browse = {};
	this.browse.newWordBtn = this.browseDiv.element(by.partialButtonText('New Word'));
	this.browse.entriesList = this.browseDiv.all(by.repeater('entry in show.entries'));

	this.browse.old_findEntryByLexeme = function(lexeme) {
		var foundRow = undefined;
		var result = protractor.promise.defer();
		var re = new RegExp(lexeme);
		page.browse.entriesList.map(function(row) {
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
	this.browse.old_clickEntryByLexeme = function(lexeme) {
		page.browse.old_findEntryByLexeme().then(function(row) {
			row.click();
		});
	};
	this.browse.better_findEntryByLexeme = function(lexeme) {
		return page.browse.entriesList.filter(function(row) {
			return row.element(by.binding('entry.word')).getText().then(function(word) {
				return (word == lexeme);
			});
		});
	};
	this.browse.better_clickEntryByLexeme = function(lexeme) {
		page.browse.better_findEntryByLexeme(lexeme).then(function(matched_rows) {
			matched_rows[0].click();
		});
	};
	this.browse.findEntryByLexeme = this.browse.better_findEntryByLexeme;
	this.browse.clickEntryByLexeme = this.browse.better_clickEntryByLexeme;
	
	// --- Edit view ---
	this.edit = {};
	this.edit.fields = this.editDiv.all(by.repeater('fieldName in config.fieldOrder'));
	this.edit.toListLink     = $('#toListLink');
	this.edit.toCommentsLink = $('#toCommentsLink');

	this.edit.getLexemeDivByWsid = function(searchWsid) {
		var lexeme = page.edit.fields.get(0);
		var writingSystemDivs = lexeme.all(by.repeater('tag in config.inputSystems'));
		return writingSystemDivs.filter(function(div) {
			return div.$('span.wsid').getText().then(function(text) {
				return (text == searchWsid);
			});
		});
	};
	this.edit.getLexemeByWsid = function(searchWsid) {
		return page.edit.getLexemeDivByWsid(searchWsid).then(function(elems) {
			if (!elems.length) { return undefined; }
			return elems[0].$('input').getAttribute('value');
		});
	};

	this.edit.getLexemes = function() {
		var lexeme = page.edit.fields.get(0);
		var writingSystemDivs = lexeme.all(by.repeater('tag in config.inputSystems'));
		return writingSystemDivs.map(function(div) {
			var wsidSpan = div.element(by.css('span.wsid'));
			var wordElem = div.element(by.css('input'));
			return wsidSpan.getText().then(function(wsid) {
				return wordElem.getAttribute('value').then(function(word) {
					return {
						wsid: wsid,
						value: word,
					};
				});
			});
		});
	};
	this.edit.getLexemesAsObject = function() {
		return page.edit.getLexemes().then(function(lexemeList) {
			var result = {};
			for (var i=0,l=lexemeList.length; i<l; i++) {
				result[lexemeList[i].wsid] = lexemeList[i].value;
			}
			return result;
		});
	};
	this.edit.getFirstLexeme = function() {
		return page.edit.getLexemes().then(function(lexemeList) {
			return lexemeList[0].value;
		});
	};
	
	// --- Comment view ---
	this.comment = {};
};

module.exports = new LfDbePage();
