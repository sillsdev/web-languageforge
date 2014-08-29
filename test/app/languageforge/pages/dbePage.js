'use strict';

var projectTypes = {
	'sf': 'Community Scripture Checking', // ScriptureForge
	'lf': 'Web Dictionary', // LanguageForge
};

var util = require('../../bellows/pages/util');  // TODO: Remove if not used once page implemented
var dbeUtil = require('./dbeUtil');

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
	this.browse = {
		// Top row UI elements
		newWordBtn: page.browseDiv.element(by.partialButtonText('New Word')),
		entryCountElem: page.browseDiv.element(by.binding('entries.length')),
		getEntryCount: function() {
			return this.entryCountElem.getText().then(function(s) {
				return parseInt(s, 10);
			});
		},

		// Search typeahead
		search: {
			input: page.browseDiv.$('div.typeahead').$('input'),
			clearBtn: page.browseDiv.$('div.typeahead').$('i.icon-remove'),
			results: page.browseDiv.$('div.typeahead').all(by.repeater('e in typeahead.searchResults')),
			matchCountElem: page.browseDiv.$('div.typeahead').element(by.binding('typeahead.searchResults.length')),
			getMatchCount: function() {
				// Inside this function, "this" == page.browse.search
				return this.matchCountElem.getText().then(function(s) {
					return parseInt(s, 10);
				});
			},
		},

		// Entries list (main body of view)
		entriesList: page.browseDiv.all(by.repeater('entry in show.entries')),
		findEntryByLexeme: function(lexeme) {
			return this.entriesList.filter(function(row) {
				return row.element(by.binding('entry.word')).getText().then(function(word) {
					return (word == lexeme);
				});
			});
		},
		clickEntryByLexeme: function(lexeme) {
			this.findEntryByLexeme(lexeme).then(function(matched_rows) {
				matched_rows[0].click();
			});
		},
	};

	// --- Edit view ---
	this.edit = {
		fields: page.editDiv.all(by.repeater('fieldName in config.fieldOrder')),
		toListLink    : $('#toListLink'),
		toCommentsLink: $('#toCommentsLink'),
		
		// Show/Hide fields button and associated functions
		toggleUncommonFieldsBtn: page.editDiv.$('#toggleUncommonFieldsBtn'),
		toggleUncommonFieldsBtnText: {
			'show': 'Show All Fields',
			'hide': 'Hide Uncommon Fields',
		},
		showUncommonFields: function() {
			// Only click the button if it will result in fields being shown
			this.toggleUncommonFieldsBtn.getText().then(function(text) {
				if (text == page.edit.toggleUncommonFieldsBtnText.show) {
					page.edit.toggleUncommonFieldsBtn.click();
				}
			});
		},
		hideUncommonFields: function() {
			// Only click the button if it will result in fields being hidden
			this.toggleUncommonFieldsBtn.getText().then(function(text) {
				if (text == page.edit.toggleUncommonFieldsBtnText.hide) {
					page.edit.toggleUncommonFieldsBtn.click();
				}
			});
		},

		// Left sidebar UI elements
		newWordBtn: page.editDiv.$('button[data-ng-click="newEntry()'),
		entryCountElem: page.editDiv.element(by.binding('entries.length')),
		getEntryCount: function() {
			return this.entryCountElem.getText().then(function(s) {
				return parseInt(s, 10);
			});
		},
		entriesList: page.editDiv.all(by.repeater('entry in show.entries')),
		findEntryByLexeme: function(lexeme) {
			var div = page.editDiv.$('#compactEntryListContainer');
			return div.element(by.cssContainingText('[ng-bind-html="getWordForDisplay(entry)"', lexeme));
		},
		clickEntryByLexeme: function(lexeme) {
			this.findEntryByLexeme(lexeme).then(function(elem) {
				elem.click();
			});
		},
		findEntryByDefinition: function(definition) {
			var div = page.editDiv.$('#compactEntryListContainer');
			return div.element(by.cssContainingText('[ng-bind-html="getMeaningForDisplay(entry)"', definition));
		},
		clickEntryByDefinition: function(definition) {
			this.findEntryByDefinition(definition).then(function(elem) {
				elem.click();
			});
		},
		search: {
			input: page.editDiv.$('div.typeahead').$('input'),
			clearBtn: page.editDiv.$('div.typeahead').$('i.icon-remove'),
			results: page.editDiv.$('div.typeahead').all(by.repeater('e in typeahead.searchResults')),
			matchCountElem: page.editDiv.$('div.typeahead').element(by.binding('typeahead.searchResults.length')),
			getMatchCount: function() {
				// Inside this function, "this" == page.edit.search
				return this.matchCountElem.getText().then(function(s) {
					return parseInt(s, 10);
				});
			},
		},

		// Top-row UI elements
		renderedDiv: page.editDiv.$('dc-rendered'),
		deleteBtn:   page.editDiv.$('button[data-ng-click="deleteEntry(currentEntry)"]'),
		saveBtn:     page.editDiv.$('button[data-ng-click="saveCurrentEntry(true)"]'),

		// Helper functions for retrieving various field values
		getLexemes: function() {
			// Returns lexemes in the format [{wsid: 'en', value: 'word'}, {wsid: 'de', value: 'Wort'}]
			var lexeme = this.fields.get(0);
			return dbeUtil.dcMultitextToArray(lexeme);
		},
		getLexemesAsObject: function() {
			// Returns lexemes in the format [{en: 'word', de: 'Wort'}]
			var lexeme = this.fields.get(0);
			return dbeUtil.dcMultitextToObject(lexeme);
		},
		getFirstLexeme: function() {
			// Returns the first (topmost) lexeme regardless of its wsid
			var lexeme = this.fields.get(0);
			return dbeUtil.dcMultitextToFirstValue(lexeme);
		},
		getLexemeByWsid: function(searchWsid) {
			var lexeme = this.fields.get(0);
			return dbeUtil.dcMultitextToObject(lexeme).then(function(lexemes) {
				return lexemes[searchWsid];
			});
		},
	
		getFields: dbeUtil.getFields,
		getSingleField: dbeUtil.getSingleField,
		getFieldsWithValues: dbeUtil.getFieldsWithValues,
		getSingleFieldWithValues: dbeUtil.getSingleFieldWithValues,
	};
	
	// --- Comment view ---
	this.comment = {};
};

module.exports = new LfDbePage();
