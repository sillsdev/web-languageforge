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
		getOneField: dbeUtil.getOneField,
		getFieldValues: dbeUtil.getFieldValues,
		getOneFieldValue: dbeUtil.getOneFieldValue,
	};
	
	// --- Comment view ---
	this.comment = {
		// Top-row UI elements
		renderedDiv: page.commentDiv.$('dc-rendered'),
		filter: {
			byTextElem:   page.commentDiv.element(by.model('commentFilter.text')),
			byStatusElem: page.commentDiv.element(by.model('commentFilter.status')),
			clearElem:    page.commentDiv.$('[title="Clear Filter] > i.icon-remove'),
			byText: function(textToFilterBy) {
				this.byTextElem.sendKeys(textToFilterBy);
			},
			byStatus: function(statusToFilterBy) {
				util.clickDropdownByValue(this.byStatusElem, statusToFilterBy);
			},
			clearByText: function() {
				this.clearElem.click();
			},
			clearByStatus: function() {
				this.byStatus('Show All');
			},
		},
		commentCountElem: page.commentDiv.element(by.binding('currentEntryCommentCounts.total')),
		getCommentCount: function() {
			return this.commentCountElem.getText().then(function(s) {
				return parseInt(s, 10);
			});
		},

		// Left half of page: entry (with clickable elements)
		entry: {
			// We can just reuse the functions from dbeUtil, since they default to
			// using $('dc-entry') as their root element.
			getFields: dbeUtil.getFields,
			getOneField: dbeUtil.getOneField,
			getFieldValues: dbeUtil.getFieldValues,
			getOneFieldValue: dbeUtil.getOneFieldValue,
		},

		// Right half of page: comments
		newComment: {
			textarea: page.commentDiv.$('.newCommentForm').$('textarea'),
			postBtn: page.commentDiv.$('.newCommentForm').element(by.buttonText('Post')),
			regardingDiv: page.commentDiv.$('.newCommentForm').$('.commentRegarding'),
			regarding: {
				clearBtn: page.commentDiv.$('.newCommentForm').$('.commentRegarding').$('i.icon-remove'),
				fieldLabel: page.commentDiv.$('.newCommentForm').$('.commentRegarding').$('.regardingFieldName'),
				fieldWsid:  page.commentDiv.$('.newCommentForm').$('.commentRegarding').$('.regardingInputSystem'),
				fieldValue: page.commentDiv.$('.newCommentForm').$('.commentRegarding').$('.regardingFieldValue'),
			},
		},
		commentsList: page.commentDiv.all(by.repeater('comment in currentEntryCommentsFiltered')),
		getComment: function(commentNum) { return page.getComment(this.commentsList, commentNum); },
	};
	this.comments = this.comment; // Allow access by either name

	this.getComment = function(commentsList, commentNum) {
		// Gets a specific comment from the list and returns its parts (via partsOfComment() below)
		// the specified comment. Usage example:
		//   expect(page.comments.getComment(0).regarding.inputSystem).toBe("th")
		// commentNum can be -1 to get the last comment, any other number is a 0-based index
		if (typeof(commentNum) === "undefined") { commentNum = 0; }
		var comment = (commentNum == -1 ? commentsList.last() : commentsList.get(commentNum));
		return page.partsOfComment(comment);
	};
	this.getReply = function(repliesList, replyNum) {
		// Like getComment, gets a specific reply from the list and returns its parts (via partsOfReply() below)
		// replyNum can be -1 to get the last reply, any other number is a 0-based index
		if (typeof(replyNum) === "undefined") { replyNum = 0; }
		var reply = (replyNum == -1 ? repliesList.last() : repliesList.get(replyNum));
		return page.partsOfReply(reply);
	};

	this.partsOfComment = function(div) {
		// Returns a Javascript object that can be used to access the parts (avatar, reply button, etc.) of a comment
		// Usage example: expect(partsOfDcComment(commentDiv).regarding.inputSystem).toBe("th")
		var replies = div.all(by.repeater('reply in model.replies')); // used in getReply() below
		return {
			wholeComment: div,

			// Left side controls
			// avatar:  div.element(by.binding('model.authorInfo.createdByUserRef.avatar_ref')),
			avatar:  div.$('.commentLeftSide img'),
			author:  div.element(by.binding('model.authorInfo.createdByUserRef.name')),
			date:    div.element(by.binding('model.authorInfo.createdDate | relativetime')),
			score:   div.element(by.binding('model.score')),
			plusOne: div.$('.commentLeftSide i.icon-thumbs-up-alt:not(.ng-hide)'),

			// Right side content
			content: div.element(by.binding('model.content')),
			edit: {
				textarea:   div.element(by.model('editingCommentContent')),
				updateBtn:  div.element(by.buttonText('Update')),
				cancelLink: div.element(by.linkText('Cancel')),
			},
			regarding: {
				// NOTE: Any or all of these may be absent in a given comment. Use isPresent() before calling expect().
				word:       div.element(by.binding('model.regarding.word')),
				meaning:    div.element(by.binding('model.regarding.meaning')),
				fieldLabel: div.element(by.binding('model.regarding.fieldNameForDisplay')),
				fieldWsid:  div.element(by.binding('model.regarding.inputSystem')),
				fieldValue: div.element(by.binding('model.regarding.fieldValue')),
			},

			// Replies (below content but above bottom controls)
			replies: replies,
			getReply: function(replyNum) { return page.getReply(replies, replyNum); },

			// Bottom controls (below replies)
			markOpenLink:     div.$('.commentBottomBar i.icon-chevron-sign-up'),
			markResolvedLink: div.$('.commentBottomBar i.icon-ok'),
			markTodoLink:     div.$('.commentBottomBar i.icon-edit'),
			editBtn:  div.element(by.buttonText('Edit')),
			replyBtn: div.element(by.buttonText('Reply')),
		};
	};

	this.partsOfReply = function(div) {
		// Like partsOfComment, returns a Javascript object giving access to the parts of a reply
		return {
			wholeReply: div,
			content:    div.element(by.model('reply.content')),
			author:     div.element(by.model('reply.authorInfo.createdByUserRef.name')),
			date:       div.element(by.model('reply.authorInfo.createdDate | relativetime')),
			editLink:   div.$('editReplyLink i.icon-chevron-sign-up'),
			deleteLink: div.$('deleteReplyLink i.icon-remove'),
			edit: {
				input:  div.$('form input'),
				submit: div.$('form button[type="submit"]'),
				cancel: div.$('form a i.icon-remove'),
			},
		};
	};

};

module.exports = new LfDbePage();
