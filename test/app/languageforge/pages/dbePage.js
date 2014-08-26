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
	this.browse.entryCountSpan = this.browseDiv.element(by.binding('entries.length'));
	this.browse.getEntryCount = function() {
		return page.browse.entryCountSpan.getText().then(function(s) {
			return parseInt(s, 10);
		});
	};
	this.browse.entriesList = this.browseDiv.all(by.repeater('entry in show.entries'));

	this.browse.findEntryByLexeme = function(lexeme) {
		return page.browse.entriesList.filter(function(row) {
			return row.element(by.binding('entry.word')).getText().then(function(word) {
				return (word == lexeme);
			});
		});
	};
	this.browse.clickEntryByLexeme = function(lexeme) {
		page.browse.findEntryByLexeme(lexeme).then(function(matched_rows) {
			matched_rows[0].click();
		});
	};
	
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
		// Returns lexemes in the format [{wsid: 'en', value: 'word'}, {wsid: 'de', value: 'Wort'}]
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
		// Returns lexemes in the format [{en: 'word'}, {de: 'Wort'}]
		return page.edit.getLexemes().then(function(lexemeList) {
			var result = {};
			for (var i=0,l=lexemeList.length; i<l; i++) {
				result[lexemeList[i].wsid] = lexemeList[i].value;
			}
			return result;
		});
	};
	this.edit.getFirstLexeme = function() {
		// Returns the first (topmost) lexeme regarless of its wsid
		return page.edit.getLexemes().then(function(lexemeList) {
			return lexemeList[0].value;
		});
	};
	
	this.edit.getVisibleFields = function() {
		return page.edit.fields.map(function(div) {
			var label = div.$('label:not(.ng-hide)');
			return label.isPresent().then(function(present) {
				if (present) {
					return label.getText().then(function(labelText) {
						return {
							label: labelText,
							div: div,
						};
					});
				} else {
					var promise = protractor.promise.defer();
					promise.fulfill(undefined);
					return promise;
				}
			});
		}).then(function(results) {
			return results.filter(function(x) { return (typeof(x) != "undefined"); });
		});
	};

	this.edit.getLabelsOfVisibleFields = function() {
		return page.edit.getVisibleFields().then(function(fields) {
			var result = [];
			fields.forEach(function(field) {
				result.push(field.label);
			});
			return result;
		});
	};
	
	// --- Comment view ---
	this.comment = {};
};

module.exports = new LfDbePage();
