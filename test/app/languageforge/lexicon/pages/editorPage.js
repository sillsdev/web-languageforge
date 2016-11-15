'use strict';

module.exports = new EditorPage();

function EditorPage() {
  var mockUpload = require('../../../bellows/pages/mockUploadElement.js');
  var util = require('../../../bellows/pages/util.js');
  var editorUtil = require('./editorUtil.js');
  var _this = this;

  this.get = function get(projectId, entryId) {
    var extra = projectId ? ('/' + projectId) : '';
    extra += (projectId && entryId) ? ('#/editor/entry/' + entryId) : '';
    browser.get(browser.baseUrl + '/app/lexicon' + extra);
  };

  this.getProjectIdFromUrl = function getProjectIdFromUrl() {
    return browser.getCurrentUrl().then(function (url) {
      var match = url.match(/\/app\/lexicon\/([0-9a-z]{24})/);
      var projectId = '';
      if (match) {
        projectId = match[1];
      }

      return projectId;
    });
  };

  this.getEntryIdFromUrl = function getEntryIdFromUrl() {
    return browser.getCurrentUrl().then(function (url) {
      var match = url.match(/\/editor\/entry\/([0-9a-z_]{6,24})/);
      var entryId = '';
      if (match) {
        entryId = match[1];
      }

      return entryId;
    });
  };

  this.noticeList = element.all(by.repeater('notice in notices()'));
  this.firstNoticeCloseButton = this.noticeList.first().element(by.buttonText('×'));

  this.browseDiv = element(by.css('#lexAppListView'));
  this.editDiv = element(by.css('#lexAppEditView'));
  this.commentDiv = element(by.css('#lexAppCommentView'));

  // --- Browse view ---
  this.browse = {

    // Top row UI elements
    newWordBtn: _this.browseDiv.element(by.partialButtonText('New Word')),
    entryCountElem: _this.browseDiv.element(by.binding('entries.length')),
    getEntryCount: function () {
      return this.entryCountElem.getText().then(function (s) {
        return parseInt(s, 10);
      });
    },

    // Search typeahead
    search: {
      input: _this.browseDiv.element(by.css('div.typeahead')).element(by.css('input')),
      clearBtn: _this.browseDiv.element(by.css('div.typeahead')).element(by.css('i.icon-remove')),
      results: _this.browseDiv.element(by.css('div.typeahead'))
        .all(by.repeater('e in typeahead.searchResults')),
      matchCountElem: _this.browseDiv.element(by.css('div.typeahead'))
        .element(by.binding('typeahead.matchCountCaption')),
      getMatchCount: function () {

        // Inside this function, "this" == _this.browse.search
        return this.matchCountElem.getText().then(function (s) {
          return parseInt(s, 10);
        });
      }
    },

    // Entries list (main body of view)
    entriesList: _this.browseDiv.all(by.repeater('entry in visibleEntries')),
    findEntryByLexeme: function (lexeme) {
      return this.entriesList.filter(function (row) {
        return row.element(by.binding('entry.word')).getText().then(function (word) {
          return (word.indexOf(lexeme) > -1);
        });
      });
    }
  };

  // --- Edit view ---
  //noinspection JSUnusedGlobalSymbols
  this.edit = {
    fields: _this.editDiv.all(by.repeater('fieldName in config.fieldOrder')),
    toListLink: element(by.css('#toListLink')),
    toCommentsLink: element(by.css('#toCommentsLink')),

    // Show/Hide fields button and associated functions
    toggleUncommonFieldsBtn: _this.editDiv.element(by.css('#toggleUncommonFieldsBtn')),
    toggleUncommonFieldsBtnText: {
      show: 'Show All Fields',
      hide: 'Hide Uncommon Fields'
    },
    showUncommonFields: function () {

      // Only click the button if it will result in fields being shown
      this.toggleUncommonFieldsBtn.getText().then(function (text) {
        if (text == _this.edit.toggleUncommonFieldsBtnText.show) {
          _this.edit.toggleUncommonFieldsBtn.click();
        }
      });
    },

    hideUncommonFields: function () {

      // Only click the button if it will result in fields being hidden
      this.toggleUncommonFieldsBtn.getText().then(function (text) {
        if (text == _this.edit.toggleUncommonFieldsBtnText.hide) {
          _this.edit.toggleUncommonFieldsBtn.click();
        }
      });
    },

    // Left sidebar UI elements
    newWordBtn: _this.editDiv.element(by.css('button[data-ng-click="newEntry()')),
    entryCountElem: _this.editDiv.element(by.binding('entries.length')),
    getEntryCount: function () {
      return this.entryCountElem.getText().then(function (s) {
        return parseInt(s, 10);
      });
    },

    entriesList: _this.editDiv.all(by.repeater('entry in visibleEntries')),
    findEntryByLexeme: function (lexeme) {
      var div = _this.editDiv.element(by.css('#compactEntryListContainer'));
      return div.element(by.cssContainingText('[data-ng-bind-html="getWordForDisplay(entry)"',
        lexeme));
    },

    findEntryByDefinition: function (definition) {
      var div = _this.editDiv.element(by.css('#compactEntryListContainer'));
      return div.element(by.cssContainingText('[data-ng-bind-html="getMeaningForDisplay(entry)"',
        definition));
    },

    search: {
      input: _this.editDiv.element(by.css('div.typeahead')).element(by.css('input')),
      clearBtn: _this.editDiv.element(by.css('div.typeahead')).element(by.css('i.icon-remove')),
      results: _this.editDiv.element(by.css('div.typeahead'))
        .all(by.repeater('e in typeahead.searchResults')),
      matchCountElem: _this.editDiv.element(by.css('div.typeahead'))
        .element(by.binding('typeahead.matchCountCaption')),
      getMatchCount: function () {
        // Inside this function, "this" == _this.edit.search
        return this.matchCountElem.getText().then(function (s) {
          return parseInt(s, 10);
        });
      }
    },

    // Top-row UI elements
    renderedDiv: _this.editDiv.element(by.css('dc-rendered')),
    deleteBtn: _this.editDiv.element(by.css('button[data-ng-click="deleteEntry(currentEntry)"]')),
    saveBtn: _this.editDiv.element(by.css('button[data-ng-click="saveCurrentEntry(true)"]')),

    // Helper functions for retrieving various field values
    getLexemes: function () {

      // Returns lexemes in the format [{wsid: 'en', value: 'word'}, {wsid:
      // 'de', value: 'Wort'}]
      var lexeme = this.fields.get(0);
      return editorUtil.dcMultitextToArray(lexeme);
    },

    getLexemesAsObject: function () {

      // Returns lexemes in the format [{en: 'word', de: 'Wort'}]
      var lexeme = this.fields.get(0);
      return editorUtil.dcMultitextToObject(lexeme);
    },

    getFirstLexeme: function () {

      // Returns the first (topmost) lexeme regardless of its wsid
      var lexeme = this.fields.get(0);
      return editorUtil.dcMultitextToFirstValue(lexeme);
    },

    getLexemeByWsid: function (searchWsid) {
      var lexeme = this.fields.get(0);
      return editorUtil.dcMultitextToObject(lexeme).then(function (lexemes) {
        return lexemes[searchWsid];
      });
    },

    audio: {
      players: function (searchLabel) {
        return editorUtil.getOneField(searchLabel).all(by.css('.player > a'));
      },

      playerIcons: function (searchLabel) {
        return editorUtil.getOneField(searchLabel).all(by.css('.player > a > i'));
      },

      moreControls: function (searchLabel) {
        return editorUtil.getOneField(searchLabel).all(by.css('.dc-audio a.dropdown-toggle'));
      },

      moreGroups: function (searchLabel, index) {
        var allMoreGroups = editorUtil.getOneField(searchLabel).all(by.css('.dc-audio .btn-group'));
        if (index !== undefined) {
          if (index < 0) index = 0;
          return allMoreGroups.get(index);
        }

        return allMoreGroups;
      },

      moreDownload: function (searchLabel, index) {
        return this.moreGroups(searchLabel, index).element(by.partialLinkText('Download'));
      },

      moreDelete: function (searchLabel, index) {
        return this.moreGroups(searchLabel, index).element(by.partialLinkText('Delete'));
      },

      moreUpload: function (searchLabel, index) {
        return this.moreGroups(searchLabel, index).element(by.partialLinkText('Upload'));
      },

      uploadButtons: function (searchLabel) {
        return editorUtil.getOneField(searchLabel).all(by.css('.dc-audio button.buttonAppend'));
      },

      uploadDropBoxes: function (searchLabel) {
        return editorUtil.getOneField(searchLabel).all(by.css('.drop-box'));
      },

      uploadCancelButtons: function (searchLabel) {
        return editorUtil.getOneField(searchLabel).all(by.id('audioAddCancel'));
      },

      downloadButtons: function (searchLabel) {
        return editorUtil.getOneField(searchLabel).all(by.css('.dc-audio a.buttonAppend'));
      },

      control: function (searchLabel, index) {
        var mockUploadElement = editorUtil.getOneField(searchLabel).all(by.css('.dc-audio'))
          .get(index);
        mockUploadElement.mockUpload = mockUpload;
        return mockUploadElement;
      }
    },

    senses: element.all(by.css('dc-sense')),

    pictures: {
      list: editorUtil.getOneField('Pictures'),
      images: editorUtil.getOneField('Pictures').all(by.css('img')),
      captions: editorUtil.getOneField('Pictures')
        .all(by.css('.input-prepend > .dc-formattedtext .ta-bind')),
      removeImages: editorUtil.getOneField('Pictures').all(by.css('.icon-remove')),
      getFileName: function (index) {
        return editorUtil.getOneFieldValue('Pictures').then(function (pictures) {
          return pictures[index].fileName;
        });
      },

      getCaption: function (index) {
        return editorUtil.getOneFieldValue('Pictures').then(function (pictures) {
          return pictures[index].caption;
        });
      },

      addPictureLink: element(by.linkText('Add Picture')),
      addDropBox: editorUtil.getOneField('Pictures').element(by.css('.drop-box')),
      addCancelButton: element(by.id('addCancel'))
    },

    getMultiTextInputs: function getMultiTextInputs(searchLabel) {
      return editorUtil.getOneField(searchLabel)
        .all(by.css('.input-prepend > .dc-formattedtext .ta-bind'));
    },

    getMultiTextInputSystems: function getMultiTextInputSystems(searchLabel) {
      return editorUtil.getOneField(searchLabel).all(by.css('.input-prepend > span.wsid'));
    },

    selectElement: editorUtil.selectElement,
    getFields: editorUtil.getFields,
    getOneField: editorUtil.getOneField,
    getFieldValues: editorUtil.getFieldValues,
    getOneFieldValue: editorUtil.getOneFieldValue
  };

  // --- Comment view ---
  //noinspection JSUnusedGlobalSymbols
  this.comment = {
    toEditLink: element(by.css('#toEditLink')),

    // Top-row UI elements
    renderedDiv: _this.commentDiv.element(by.css('dc-rendered')),
    filter: {
      byTextElem: _this.commentDiv.element(by.model('commentFilter.text')),
      byStatusElem: _this.commentDiv.element(by.model('commentFilter.status')),
      clearElem: _this.commentDiv.element(by.css('[title="Clear Filter] > i.icon-remove')),
      byText: function (textToFilterBy) {
        this.byTextElem.sendKeys(textToFilterBy);
      },

      byStatus: function (statusToFilterBy) {
        util.clickDropdownByValue(this.byStatusElem, statusToFilterBy);
      },

      clearByText: function () {
        this.clearElem.click();
      },

      clearByStatus: function () {
        this.byStatus('Show All');
      }
    },
    commentCountElem: _this.commentDiv.element(by.binding('currentEntryCommentCounts.total')),
    getCommentCount: function () {
      return this.commentCountElem.getText().then(function (s) {
        return parseInt(s, 10);
      });
    },

    // Left half of page: entry (with clickable elements)
    entry: {
      // We can just reuse the functions from dbeUtil, since they default to
      // using element(by.css('dc-entry')) as their root element.
      getFields: editorUtil.getFields,
      getOneField: editorUtil.getOneField,
      getFieldValues: editorUtil.getFieldValues,
      getOneFieldValue: editorUtil.getOneFieldValue,
      getOneFieldAllInputSystems: function getOneFieldAllInputSystems(searchLabel, idx, rootElem) {
        return editorUtil.getOneField(searchLabel, idx, rootElem).all(by.css('span.wsid'));
      }
    },

    // Right half of page: comments
    newComment: {
      textarea: _this.commentDiv.element(by.css('.newCommentForm')).element(by.css('textarea')),
      postBtn: _this.commentDiv.element(by.css('.newCommentForm')).element(by.buttonText('Post')),
      regardingDiv: _this.commentDiv.element(by.css('.newCommentForm'))
        .element(by.css('.commentRegarding')),
      regarding: {
        clearBtn: _this.commentDiv.element(by.css('.newCommentForm'))
          .element(by.css('.commentRegarding')).element(by.css('i.icon-remove')),
        fieldLabel: _this.commentDiv.element(by.css('.newCommentForm'))
          .element(by.css('.commentRegarding')).element(by.css('.regardingFieldName')),
        fieldWsid: _this.commentDiv.element(by.css('.newCommentForm'))
          .element(by.css('.commentRegarding')).element(by.css('.regardingInputSystem')),
        fieldValue: _this.commentDiv.element(by.css('.newCommentForm'))
          .element(by.css('.commentRegarding')).element(by.css('.regardingFieldValue'))
      }
    },
    commentsList: _this.commentDiv.all(by.repeater('comment in currentEntryCommentsFiltered')),
    getComment: function (commentNum) {
      return _this.getComment(this.commentsList, commentNum);
    }
  };

  // Allow access by either name
  this.comments = this.comment;

  // Gets a specific comment from the list and returns its parts (via
  // partsOfComment() below)
  // the specified comment. Usage example:
  // expect(_this.comments.getComment(0).regarding.inputSystem).toBe("th")
  // commentNum can be -1 to get the last comment, any other number is a 0-based
  // index
  this.getComment = function (commentsList, commentNum) {
    if (typeof (commentNum) === 'undefined') {
      commentNum = 0;
    }

    var comment = (commentNum == -1 ? commentsList.last() : commentsList.get(commentNum));
    return _this.partsOfComment(comment);
  };

  // Like getComment, gets a specific reply from the list and returns its parts
  // (via partsOfReply() below)
  // replyNum can be -1 to get the last reply, any other number is a 0-based
  // index
  this.getReply = function (repliesList, replyNum) {
    if (typeof (replyNum) === 'undefined') {
      replyNum = 0;
    }

    var reply = (replyNum == -1 ? repliesList.last() : repliesList.get(replyNum));
    return _this.partsOfReply(reply);
  };

  // Returns a Javascript object that can be used to access the parts (avatar,
  // reply button, etc.) of a comment
  // Usage example:
  // expect(partsOfDcComment(commentDiv).regarding.inputSystem).toBe("th")
  this.partsOfComment = function (div) {
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
        cancelLink: div.element(by.linkText('Cancel'))
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
      getReply: function (replyNum) {
        return _this.getReply(replies, replyNum);
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
  this.partsOfReply = function (div) {
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
        cancel: div.element(by.css('form a i.icon-remove'))
      }
    };
  };

}
