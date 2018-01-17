import {browser, element, by, By, $, $$, ExpectedConditions} from 'protractor';

class EditorPage {
  private readonly mockUpload = require('../../../bellows/pages/mockUploadElement.js');
  private readonly util = require('../../../bellows/pages/utils.js');
  private readonly editorUtil = require('./editorUtil.js');
  private readonly CONDITION_TIMEOUT = 3000;

  get(projectId: string, entryId: string) {
    let extra = projectId ? ('/' + projectId) : '';
    extra += (projectId && entryId) ? ('#!/editor/entry/' + entryId) : '';
    browser.get(browser.baseUrl + '/app/lexicon' + extra);
  };

  getProjectIdFromUrl() {
    return browser.getCurrentUrl().then((url) => {
      const match = url.match(/\/app\/lexicon\/([0-9a-z]{24})/);
      let projectId = '';
      if (match) {
        projectId = match[1];
      }

      return projectId;
    });
  }

  getEntryIdFromUrl() {
    return browser.getCurrentUrl().then((url) => {
      const match = url.match(/\/editor\/entry\/([0-9a-z_]{6,24})/);
      let entryId = '';
      if (match) {
        entryId = match[1];
      }

      return entryId;
    });
  }

  noticeList = element.all(by.repeater('notice in $ctrl.notices()'));
  firstNoticeCloseButton = this.noticeList.first().element(by.partialButtonText('×'));

  browseDiv = element(by.id('lexAppListView'));
  browseDivSearch = this.browseDiv.element(by.id('editor-list-search-entries'));
  editDiv = element(by.id('lexAppEditView'));
  editDivSearch = this.editDiv.element(by.id('editor-entry-search-entries'));
  editToolbarDiv = element(by.id('lexAppToolbar'));
  commentDiv = element(by.id('lexAppCommentView'));

  // --- Browse view ---
  browse = {
    // Top row UI elements
    noEntriesElem: this.browseDiv.element(by.id('noEntries')),
    noEntriesNewWordBtn: element(by.id('noEntriesNewWord')),
    newWordBtn: element(by.id('newWord')),
    entryCountElem: this.browseDiv.element(by.id('totalNumberOfEntries')),
    getEntryCount() {
      // assumption is entry count > 0
      browser.wait(ExpectedConditions.visibilityOf(this.entryCountElem), this.CONDITION_TIMEOUT);
      return this.entryCountElem.getText().then((s: any) =>
        parseInt(s, 10)
      );
    },

    // Search typeahead
    search: {
      input: this.browseDivSearch.element(by.css('input')),
      clearBtn: this.browseDivSearch.element(by.className('fa-times')),
      results: this.browseDivSearch.all(by.repeater('e in typeahead.searchResults')),
      matchCountElem: this.browseDivSearch.element(by.binding('typeahead.matchCountCaption')),
      getMatchCount() {
        // Inside this function, "this" ==  EditorPage.browse.search
        return this.matchCountElem.getText().then((s: any) =>
          parseInt(s, 10)
        );
      }
    },

    // Entries list (main body of view)
    entriesList: this.browseDiv.all(by.repeater('entry in visibleEntries track by entry.id')),
    findEntryByLexeme(lexeme: any) {
      browser.wait(ExpectedConditions.visibilityOf(
        element(by.id('lexAppListView'))),this.CONDITION_TIMEOUT);
      return this.entriesList.filter((row: any) => {
        const element = row.element(by.binding('entry.word'));

        // fix problem with protractor not scrolling to element before click
        browser.driver.executeScript('arguments[0].scrollIntoView();', element.getWebElement());
        return element.getText().then((word: any) =>
          (word.indexOf(lexeme) > -1)
        );
      });
    }
  };

  // --- Edit view ---
  edit = {
    // Top row UI elements
    toListLink: this.editToolbarDiv.element(by.id('toListLink')),
    saveBtn: this.editToolbarDiv.element(by.id('saveEntryBtn')),
    toggleHiddenFieldsBtn: this.editToolbarDiv.element(by.id('toggleHiddenFieldsBtn')),
    toCommentsLink: this.editToolbarDiv.element(by.id('toCommentsLink')),

    // Show/Hide fields functions
    toggleHiddenFieldsBtnText: {
      show: 'Show Extra Fields',
      hide: 'Hide Extra Fields'
    },
    showHiddenFields() {
      // Only click the button if it will result in fields being shown
      this.toggleHiddenFieldsBtn.getText().then((text: any) => {
        if (text === this.toggleHiddenFieldsBtnText.show) {
          this.util.scrollTop();
          this.toggleHiddenFieldsBtn.click();
        }
      });
    },

    hideHiddenFields() {
      // Only click the button if it will result in fields being hidden
      this.toggleHiddenFieldsBtn.getText().then((text: any) => {
        if (text === this.toggleHiddenFieldsBtnText.hide) {
          this.util.scrollTop();
          this.toggleHiddenFieldsBtn.click();
        }
      });
    },

    // Left sidebar UI elements
    newWordBtn: this.editDiv.element(by.id('editorNewWordBtn')),
    entryCountElem: this.editDiv.element(by.id('totalNumberOfEntries')),
    getEntryCount() {
      return this.entryCountElem.getText().then((s: any) =>
        parseInt(s, 10)
      );
    },

    entriesList: this.editDiv.all(by.repeater('entry in visibleEntries')),
    findEntryByLexeme(lexeme: any) {
      const div = this.editDiv.element(by.id('compactEntryListContainer'));
      return div.element(by.cssContainingText('.listItemPrimary',
        lexeme));
    },

    findEntryByDefinition(definition: any) {
      const div = this.editDiv.element(by.id('compactEntryListContainer'));
      return div.element(by.cssContainingText('.listItemSecondary',
        definition));
    },

    search: {
      input: this.editDivSearch.element(by.css('input')),
      clearBtn: this.editDivSearch.element(by.className('fa-times')),
      results: this.editDivSearch.all(by.repeater('e in typeahead.searchResults')),
      matchCountElem: this.editDivSearch.element(by.binding('typeahead.matchCountCaption')),
      getMatchCount() {
        // Inside this function, "this" == EditorPage.edit.search
        return this.matchCountElem.getText().then((s: any) =>
          parseInt(s, 10)
        );
      }
    },

    // Top-row
    renderedDiv: this.editDiv.element(by.id('entryContainer')),
    deleteBtn: this.editDiv.element(by.id('deleteEntry')),

    // Helper functions for retrieving various field values
    fields: this.editDiv.all(by.repeater('fieldName in config.fieldOrder')),
    getLexemes() {

      // Returns lexemes in the format [{wsid: 'en', value: 'word'}, {wsid:
      // 'de', value: 'Wort'}]
      const lexeme = this.fields.get(0);
      return this.editorUtil.dcMultitextToArray(lexeme);
    },

    getLexemesAsObject() {

      // Returns lexemes in the format [{en: 'word', de: 'Wort'}]
      const lexeme = this.fields.get(0);
      return this.editorUtil.dcMultitextToObject(lexeme);
    },

    getFirstLexeme() {
      browser.wait(ExpectedConditions.visibilityOf(this.fields.get(0)),this.CONDITION_TIMEOUT);

      // Returns the first (topmost) lexeme regardless of its wsid
      const lexeme = this.fields.get(0);
      return this.editorUtil.dcMultitextToFirstValue(lexeme);
    },

    getLexemeByWsid(searchWsid: any) {
      const lexeme = this.fields.get(0);
      return this.editorUtil.dcMultitextToObject(lexeme).then((lexemes: any) =>
        lexemes[searchWsid]
      );
    },

    audio: {
      players(searchLabel: any) {
        return this.editorUtil.getOneField(searchLabel).all(by.css('.player a'));
      },

      playerIcons(searchLabel: any) {
        return this.editorUtil.getOneField(searchLabel).all(by.css('.player a > i'));
      },

      moreControls(searchLabel: any) {
        return this.editorUtil.getOneField(searchLabel).all(by.css('.dc-audio a.dropdown-toggle'));
      },

      moreGroups(searchLabel: string, index: number) {
        const allMoreGroups = this.editorUtil.getOneField(searchLabel).all(by.css('.dc-audio .dropdown'));
        if (index !== undefined) {
          if (index < 0) index = 0;
          return allMoreGroups.get(index);
        }

        return allMoreGroups;
      },

      moreDownload(searchLabel: string, index: number) {
        return this.moreGroups(searchLabel, index).element(by.id('dc-audio-download'));
      },

      moreDelete(searchLabel: string, index: number) {
        return this.moreGroups(searchLabel, index).element(by.id('dc-audio-delete'));
      },

      moreUpload(searchLabel: string, index: number) {
        return this.moreGroups(searchLabel, index).element(by.id('dc-audio-upload'));
      },

      uploadButtons(searchLabel: string) {
        return this.editorUtil.getOneField(searchLabel).all(by.css('.dc-audio button.buttonAppend'));
      },

      uploadDropBoxes(searchLabel: string) {
        return this.editorUtil.getOneField(searchLabel).all(by.css('.drop-box'));
      },

      uploadCancelButtons(searchLabel: string) {
        return this.editorUtil.getOneField(searchLabel).all(by.css('.dc-audio i.fa-times'));
      },

      downloadButtons(searchLabel: string) {
        return this.editorUtil.getOneField(searchLabel).all(by.css('.dc-audio a.buttonAppend'));
      },

      control(searchLabel: string, index: number) {
        const mockUploadElement = this.editorUtil.getOneField(searchLabel).all(by.css('.dc-audio'))
          .get(index);
        mockUploadElement.mockUpload = this.mockUpload;
        return mockUploadElement;
      }
    },

    senses: element.all(by.css('dc-sense')),

    pictures: {
      list: this.editorUtil.getOneField('Pictures'),
      images: this.editorUtil.getOneField('Pictures').all(by.css('img')),
      captions: this.editorUtil.getOneField('Pictures')
        .all(by.css('.input-group > .dc-formattedtext .ta-bind')),
      removeImages: this.editorUtil.getOneField('Pictures').all(by.className('fa-trash')),
      getFileName(index: any) {
        return this.editorUtil.getOneFieldValue('Pictures').then((pictures: any) =>
          pictures[index].fileName
        );
      },

      getCaption(index: any) {
        return this.editorUtil.getOneFieldValue('Pictures').then((pictures: any) =>
          pictures[index].caption
        );
      },

      addPictureLink: element(by.id('dc-picture-add-btn')),
      addDropBox: this.editorUtil.getOneField('Pictures').element(by.css('.drop-box')),
      addCancelButton: element(by.id('addCancel'))
    },

    getMultiTextInputs(searchLabel: any) {
      return this.editorUtil.getOneField(searchLabel)
        .all(by.css('.input-group > .dc-formattedtext .ta-bind'));
    },

    getMultiTextInputSystems(searchLabel: any) {
      return this.editorUtil.getOneField(searchLabel).all(by.css('.input-group > span.wsid'));
    },

    selectElement: this.editorUtil.selectElement,
    getFields: this.editorUtil.getFields,
    getOneField: this.editorUtil.getOneField,
    getFieldValues: this.editorUtil.getFieldValues,
    getOneFieldValue: this.editorUtil.getOneFieldValue
  };

  // --- Comment view ---
  comment = {
    toEditLink: element(by.id('toEditLink')),

    // Top-row UI elements
    renderedDiv: this.commentDiv.element(by.css('dc-rendered')),
    filter: {
      byTextElem: this.commentDiv.element(by.model('commentFilter.text')),
      byStatusElem: this.commentDiv.element(by.model('commentFilter.status')),
      clearElem: this.commentDiv.element(by.css('[title="Clear Filter] > i.fa-times')),
      byText(textToFilterBy: string) {
        this.byTextElem.sendKeys(textToFilterBy);
      },

      byStatus(statusToFilterBy: string) {
        this.util.clickDropdownByValue(this.byStatusElem, statusToFilterBy);
      },

      clearByText() {
        this.clearElem.click();
      },

      clearByStatus() {
        this.byStatus('Show All');
      }
    },
    commentCountElem: this.commentDiv.element(by.binding('currentEntryCommentCounts.total')),
    getCommentCount() {
      return this.commentCountElem.getText().then((s: string) =>
        parseInt(s, 10)
      );
    },

    // Left half of page: entry (with clickable elements)
    entry: {
      // We can just reuse the functions from dbeUtil, since they default to
      // using element(by.css('dc-entry')) as their root element.
      getFields: this.editorUtil.getFields,
      getOneField: this.editorUtil.getOneField,
      getFieldValues: this.editorUtil.getFieldValues,
      getOneFieldValue: this.editorUtil.getOneFieldValue,
      getOneFieldAllInputSystems(searchLabel: string, idx: number, rootElem: any) {
        return this.editorUtil.getOneField(searchLabel, idx, rootElem).all(by.css('span.wsid'));
      }
    },

    // Right half of page: comments
    newComment: {
      textarea: element(by.id('comment-panel-textarea')),
      postBtn: element(by.id('comment-panel-post-btn')),
    },
    commentsList: this.commentDiv.all(by.repeater('comment in currentEntryCommentsFiltered')),
    getComment(commentNum: number) {
      return this.getComment(this.comment.commentsList, commentNum);
    }
  };

  // Allow access by either name
  comments = this.comment;

  // Gets a specific comment from the list and returns its parts (via
  // partsOfComment() below)
  // the specified comment. Usage example:
  // expect(this.comments.getComment(0).regarding.inputSystem).toBe("th")
  // commentNum can be -1 to get the last comment, any other number is a 0-based
  // index
  getComment(commentsList: any, commentNum: number) {
    if (typeof (commentNum) === 'undefined') {
      commentNum = 0;
    }

    const comment = (commentNum === -1 ? commentsList.last() : commentsList.get(commentNum));
    return this.partsOfComment(comment);
  };

  // Like getComment, gets a specific reply from the list and returns its parts
  // (via partsOfReply() below)
  // replyNum can be -1 to get the last reply, any other number is a 0-based
  // index
  getReply(repliesList: any, replyNum: number) {
    if (typeof (replyNum) === 'undefined') {
      replyNum = 0;
    }

    const reply = (replyNum === -1 ? repliesList.last() : repliesList.get(replyNum));
    return this.partsOfReply(reply);
  };

  // Returns a Javascript object that can be used to access the parts (avatar,
  // reply button, etc.) of a comment
  // Usage example:
  // expect(partsOfDcComment(commentDiv).regarding.inputSystem).toBe("th")
  partsOfComment(div: any) {
    const replies = div.all(by.repeater('reply in model.replies')); // used in
    // getReply()
    // below
    return {
      wholeComment: div,

      // Left side controls
      // avatar:
      // div.element(by.binding('model.authorInfo.createdByUserRef.avatar_ref')),
      avatar: div.element(by.css('.comment-footer img')),
      author: div.element(by.binding('comment.authorInfo.createdByUserRef.name')),
      date: div.element(by.binding('comment.authorInfo.createdDate | relativetime')),
      score: div.element(by.binding('comment.score')),
      plusOne: div.element(by.css('.comment-footer i.fa-thumbs-o-up:not(.ng-hide)')),

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
        definition: div.element(by.binding('comment.regarding.meaning')),
        fieldLabel: div.element(by.binding('comment.regarding.fieldNameForDisplay')),
        fieldWsid: div.element(by.binding('comment.regarding.inputSystem')),
        fieldValue: div.element(by.css('.regardingFieldValue'))
      },

      // Replies (below content but above bottom controls)
      replies: replies,
      getReply(replyNum: number) {
        return this.getReply(replies, replyNum);
      },

      // Bottom controls (below replies)
      markOpenLink: div.element(by.css('.commentBottomBar i.fa-chevron-sign-up')),
      markResolvedLink: div.element(by.css('.commentBottomBar i.fa-check')),
      markTodoLink: div.element(by.css('.commentBottomBar i.fa-edit')),
      editBtn: div.element(by.buttonText('Edit')),
      replyBtn: div.element(by.buttonText('Reply'))
    };
  };

  // Like partsOfComment, returns a Javascript object giving access to the parts
  // of a reply
  partsOfReply(div: any) {
    return {
      wholeReply: div,
      content: div.element(by.model('reply.content')),
      author: div.element(by.model('reply.authorInfo.createdByUserRef.name')),
      date: div.element(by.model('reply.authorInfo.createdDate | relativetime')),
      editLink: div.element(by.css('editReplyLink i.fa-chevron-sign-up')),
      deleteLink: div.element(by.css('deleteReplyLink i.fa-trash')),
      edit: {
        input: div.element(by.css('form input')),
        submit: div.element(by.css('form button[type="submit"]')),
        cancel: div.element(by.css('form a i.fa-times'))
      }
    };
  };

}


module.exports = new EditorPage();
