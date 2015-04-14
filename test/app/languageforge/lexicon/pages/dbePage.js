'use strict';

var projectTypes = {

  // ScriptureForge
  'sf': 'Community Scripture Checking',

  // LanguageForge
  'lf': 'Web Dictionary',
};

var util = require('../../../bellows/pages/util'); // TODO: Remove if not used once page implemented
var dbeUtil = require('./dbeUtil');

var LfDbePage = function() {
  var page = this;
  this.url = "/app/lexicon";
  this.get = function(projectId) {
    var extra = projectId ? ("/" + projectId) : "";
    browser.get(browser.baseUrl + page.url + extra);
    browser.waitForAngular();
  };

  this.browseDiv = element(by.css('#lexAppListView'));
  this.editDiv = element(by.css('#lexAppEditView'));
  this.commentDiv = element(by.css('#lexAppCommentView'));

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
      input: page.browseDiv.element(by.css('div.typeahead')).element(by.css('input')),
      clearBtn: page.browseDiv.element(by.css('div.typeahead')).element(by.css('i.icon-remove')),
      results: page.browseDiv.element(by.css('div.typeahead')).all(by.repeater('e in typeahead.searchResults')),
      matchCountElem: page.browseDiv.element(by.css('div.typeahead')).element(by.binding('typeahead.searchResults.length')),
      getMatchCount: function() {

        // Inside this function, "this" == page.browse.search
        return this.matchCountElem.getText().then(function(s) {
          return parseInt(s, 10);
        });
      },
    },

    // Entries list (main body of view)
    entriesList: page.browseDiv.all(by.repeater('entry in visibleEntries')),
    findEntryByLexeme: function(lexeme) {
      return this.entriesList.filter(function(row) {
        return row.element(by.binding('entry.word')).getText().then(function(word) {
          return (word.indexOf(lexeme) > -1);
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
    toListLink: element(by.css('#toListLink')),
    toCommentsLink: element(by.css('#toCommentsLink')),

    // Show/Hide fields button and associated functions
    toggleUncommonFieldsBtn: page.editDiv.element(by.css('#toggleUncommonFieldsBtn')),
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
    newWordBtn: page.editDiv.element(by.css('button[data-ng-click="newEntry()')),
    entryCountElem: page.editDiv.element(by.binding('entries.length')),
    getEntryCount: function() {
      return this.entryCountElem.getText().then(function(s) {
        return parseInt(s, 10);
      });
    },
    entriesList: page.editDiv.all(by.repeater('entry in visibleEntries')),
    findEntryByLexeme: function(lexeme) {
      var div = page.editDiv.element(by.css('#compactEntryListContainer'));
      return div.element(by.cssContainingText('[ng-bind-html="getWordForDisplay(entry)"', lexeme));
    },
    clickEntryByLexeme: function(lexeme) {
      this.findEntryByLexeme(lexeme).then(function(elem) {
        elem.click();
      });
    },
    findEntryByDefinition: function(definition) {
      var div = page.editDiv.element(by.css('#compactEntryListContainer'));
      return div.element(by.cssContainingText('[ng-bind-html="getMeaningForDisplay(entry)"', definition));
    },
    clickEntryByDefinition: function(definition) {
      this.findEntryByDefinition(definition).then(function(elem) {
        elem.click();
      });
    },
    search: {
      input: page.editDiv.element(by.css('div.typeahead')).element(by.css('input')),
      clearBtn: page.editDiv.element(by.css('div.typeahead')).element(by.css('i.icon-remove')),
      results: page.editDiv.element(by.css('div.typeahead')).all(by.repeater('e in typeahead.searchResults')),
      matchCountElem: page.editDiv.element(by.css('div.typeahead')).element(by.binding('typeahead.searchResults.length')),
      getMatchCount: function() {
        // Inside this function, "this" == page.edit.search
        return this.matchCountElem.getText().then(function(s) {
          return parseInt(s, 10);
        });
      },
    },

    // Top-row UI elements
    renderedDiv: page.editDiv.element(by.css('dc-rendered')),
    deleteBtn: page.editDiv.element(by.css('button[data-ng-click="deleteEntry(currentEntry)"]')),
    saveBtn: page.editDiv.element(by.css('button[data-ng-click="saveCurrentEntry(true)"]')),

    // Helper functions for retrieving various field values
    getLexemes: function() {

      // Returns lexemes in the format [{wsid: 'en', value: 'word'}, {wsid:
      // 'de', value: 'Wort'}]
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
    
    pictures: {
      list: dbeUtil.getOneField('Pictures'),
      images: dbeUtil.getOneField('Pictures').all(by.css('img')),
      captions: dbeUtil.getOneField('Pictures').all(by.css('.input-prepend > input')),
      removeImages: dbeUtil.getOneField('Pictures').all(by.css('.icon-remove')),
      getFileName: function(index) {
        return dbeUtil.getOneFieldValue('Pictures').then(function(pictures) {
          return pictures[index].fileName;
        });
      },
      getCaption: function(index) {
        return dbeUtil.getOneFieldValue('Pictures').then(function(pictures) {
          return pictures[index].caption;
        });
      },
      addPictureLink: element(by.linkText('Add Picture')),
      addDropBox: dbeUtil.getOneField('Pictures').element(by.css('.drop-box')),
      addCancelButton: element(by.id('addCancel'))
    },

    getMultiTextInputs: function getMultiTextInputs(searchLabel) {
      return dbeUtil.getOneField(searchLabel).all(by.css('.input-prepend > input'));
    }, 
      
    getFields: dbeUtil.getFields,
    getOneField: dbeUtil.getOneField,
    getFieldValues: dbeUtil.getFieldValues,
    getOneFieldValue: dbeUtil.getOneFieldValue,
  };

  // --- Comment view ---
  this.comment = {
    toEditLink: element(by.css('#toEditLink')),

    // Top-row UI elements
    renderedDiv: page.commentDiv.element(by.css('dc-rendered')),
    filter: {
      byTextElem: page.commentDiv.element(by.model('commentFilter.text')),
      byStatusElem: page.commentDiv.element(by.model('commentFilter.status')),
      clearElem: page.commentDiv.element(by.css('[title="Clear Filter] > i.icon-remove')),
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
      // using element(by.css('dc-entry')) as their root element.
      getFields: dbeUtil.getFields,
      getOneField: dbeUtil.getOneField,
      getFieldValues: dbeUtil.getFieldValues,
      getOneFieldValue: dbeUtil.getOneFieldValue,
    },

    // Right half of page: comments
    newComment: {
      textarea: page.commentDiv.element(by.css('.newCommentForm')).element(by.css('textarea')),
      postBtn: page.commentDiv.element(by.css('.newCommentForm')).element(by.buttonText('Post')),
      regardingDiv: page.commentDiv.element(by.css('.newCommentForm')).element(by.css('.commentRegarding')),
      regarding: {
        clearBtn: page.commentDiv.element(by.css('.newCommentForm')).element(by.css('.commentRegarding')).element(by.css('i.icon-remove')),
        fieldLabel: page.commentDiv.element(by.css('.newCommentForm')).element(by.css('.commentRegarding')).element(by.css('.regardingFieldName')),
        fieldWsid: page.commentDiv.element(by.css('.newCommentForm')).element(by.css('.commentRegarding')).element(by.css('.regardingInputSystem')),
        fieldValue: page.commentDiv.element(by.css('.newCommentForm')).element(by.css('.commentRegarding')).element(by.css('.regardingFieldValue')),
      },
    },
    commentsList: page.commentDiv.all(by.repeater('comment in currentEntryCommentsFiltered')),
    getComment: function(commentNum) {
      return page.getComment(this.commentsList, commentNum);
    },
  };

  // Allow access by either name
  this.comments = this.comment;

  // Gets a specific comment from the list and returns its parts (via
  // partsOfComment() below)
  // the specified comment. Usage example:
  // expect(page.comments.getComment(0).regarding.inputSystem).toBe("th")
  // commentNum can be -1 to get the last comment, any other number is a 0-based
  // index
  this.getComment = function(commentsList, commentNum) {
    if (typeof (commentNum) === "undefined") {
      commentNum = 0;
    }
    var comment = (commentNum == -1 ? commentsList.last() : commentsList.get(commentNum));
    return page.partsOfComment(comment);
  };

  // Like getComment, gets a specific reply from the list and returns its parts
  // (via partsOfReply() below)
  // replyNum can be -1 to get the last reply, any other number is a 0-based
  // index
  this.getReply = function(repliesList, replyNum) {
    if (typeof (replyNum) === "undefined") {
      replyNum = 0;
    }
    var reply = (replyNum == -1 ? repliesList.last() : repliesList.get(replyNum));
    return page.partsOfReply(reply);
  };

  // Returns a Javascript object that can be used to access the parts (avatar,
  // reply button, etc.) of a comment
  // Usage example:
  // expect(partsOfDcComment(commentDiv).regarding.inputSystem).toBe("th")
  this.partsOfComment = function(div) {
    var replies = div.all(by.repeater('reply in model.replies')); // used in
                                                                  // getReply()
                                                                  // below
    return {
      wholeComment: div,

      // Left side controls
      // avatar:
      // div.element(by.binding('model.authorInfo.createdByUserRef.avatar_ref')),
      avatar: div.element(by.css('.commentLeftSide img')),
      author: div.element(by.binding('comment.authorInfo.createdByUserRef.name')),
      date: div.element(by.binding('comment.authorInfo.createdDate | relativetime')),
      score: div.element(by.binding('comment.score')),
      plusOne: div.element(by.css('.commentLeftSide i.icon-thumbs-up-alt:not(.ng-hide)')),

      // Right side content
      content: div.element(by.binding('comment.content')),
      edit: {
        textarea: div.element(by.model('editingCommentContent')),
        updateBtn: div.element(by.buttonText('Update')),
        cancelLink: div.element(by.linkText('Cancel')),
      },
      regarding: {
        // NOTE: Any or all of these may be absent in a given comment. Use
        // isPresent() before calling expect().
        word: div.element(by.binding('comment.regarding.word')),
        meaning: div.element(by.binding('comment.regarding.meaning')),
        fieldLabel: div.element(by.binding('comment.regarding.fieldNameForDisplay')),
        fieldWsid: div.element(by.binding('comment.regarding.inputSystem')),
        fieldValue: div.element(by.css('.regardingFieldValue'))
      },

      // Replies (below content but above bottom controls)
      replies: replies,
      getReply: function(replyNum) {
        return page.getReply(replies, replyNum);
      },

      // Bottom controls (below replies)
      markOpenLink: div.element(by.css('.commentBottomBar i.icon-chevron-sign-up')),
      markResolvedLink: div.element(by.css('.commentBottomBar i.icon-ok')),
      markTodoLink: div.element(by.css('.commentBottomBar i.icon-edit')),
      editBtn: div.element(by.buttonText('Edit')),
      replyBtn: div.element(by.buttonText('Reply'))
    };
  };

  // Like partsOfComment, returns a Javascript object giving access to the parts
  // of a reply
  this.partsOfReply = function(div) {
    return {
      wholeReply: div,
      content: div.element(by.model('reply.content')),
      author: div.element(by.model('reply.authorInfo.createdByUserRef.name')),
      date: div.element(by.model('reply.authorInfo.createdDate | relativetime')),
      editLink: div.element(by.css('editReplyLink i.icon-chevron-sign-up')),
      deleteLink: div.element(by.css('deleteReplyLink i.icon-remove')),
      edit: {
        input: div.element(by.css('form input')),
        submit: div.element(by.css('form button[type="submit"]')),
        cancel: div.element(by.css('form a i.icon-remove')),
      },
    };
  };

};

module.exports = new LfDbePage();
