import {$, $$, browser, by, By, element, ExpectedConditions} from 'protractor';
import { ElementArrayFinder, ElementFinder } from 'protractor/built/element';
import { MockUploadElement } from '../../../bellows/pages/mockUploadElement';
import { Utils } from '../../../bellows/pages/utils';
import { EditorUtil } from './editorUtil';

const mockUpload = new MockUploadElement();
const utils = new Utils();
const editorUtil = new EditorUtil();
const CONDITION_TIMEOUT = 3000;

export class EditorPage {

  get(projectId: string, entryId: string) {
    let extra = projectId ? ('/' + projectId) : '';
    extra += (projectId && entryId) ? ('#!/editor/entry/' + entryId) : '';
    browser.get(browser.baseUrl + '/app/lexicon' + extra);
  }

  getProjectIdFromUrl() {
    return browser.getCurrentUrl().then(url => {
      const match = url.match(/\/app\/lexicon\/([0-9a-z]{24})/);
      let projectId = '';
      if (match) {
        projectId = match[1];
      }

      return projectId;
    });
  }

  getEntryIdFromUrl() {
    return browser.getCurrentUrl().then(url => {
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
    getEntryCount: () => {
      // assumption is entry count > 0
      browser.wait(ExpectedConditions.visibilityOf(this.browse.entryCountElem), CONDITION_TIMEOUT);
      return this.browse.entryCountElem.getText().then((s: string) =>
        parseInt(s, 10)
      );
    },

    // Search typeahead
    search: {
      input: this.browseDivSearch.element(by.css('input')),
      clearBtn: this.browseDivSearch.element(by.className('fa-times')),
      results: this.browseDivSearch.all(by.repeater('e in typeahead.searchResults')),
      matchCountElem: this.browseDivSearch.element(by.binding('typeahead.matchCountCaption')),
      getMatchCount: () => {
        // Inside this function, "this" ==  EditorPage.browse.search
        return this.browse.search.matchCountElem.getText().then((s: string) =>
          parseInt(s, 10)
        );
      }
    },

    // Entries list (main body of view)
    entriesList: this.browseDiv.all(by.repeater('entry in visibleEntries track by entry.id')),
    findEntryByLexeme: (lexeme: string) => {
      browser.wait(ExpectedConditions.visibilityOf(
        element(by.id('lexAppListView'))), CONDITION_TIMEOUT);
      return this.browse.entriesList.filter((row: ElementFinder) => {
        const elem = row.element(by.binding('entry.word'));

        // fix problem with protractor not scrolling to element before click
        browser.driver.executeScript('arguments[0].scrollIntoView();', elem.getWebElement());
        return elem.getText().then((word: string) =>
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
    showHiddenFields: () => {
      // Only click the button if it will result in fields being shown
      this.edit.toggleHiddenFieldsBtn.getText().then((text: string) => {
        if (text === this.edit.toggleHiddenFieldsBtnText.show) {
          utils.scrollTop();
          this.edit.toggleHiddenFieldsBtn.click();
        }
      });
    },

    hideHiddenFields: () => {
      // Only click the button if it will result in fields being hidden
      this.edit.toggleHiddenFieldsBtn.getText().then((text: string) => {
        if (text === this.edit.toggleHiddenFieldsBtnText.hide) {
          utils.scrollTop();
          this.edit.toggleHiddenFieldsBtn.click();
        }
      });
    },

    // Left sidebar UI elements
    newWordBtn: this.editDiv.element(by.id('editorNewWordBtn')),
    entryCountElem: this.editDiv.element(by.id('totalNumberOfEntries')),
    getEntryCount: () => {
      return this.edit.entryCountElem.getText().then((s: string) =>
        parseInt(s, 10)
      );
    },

    entriesList: this.editDiv.all(by.repeater('entry in visibleEntries')),
    findEntryByLexeme: (lexeme: string) => {
      const div = this.editDiv.element(by.id('compactEntryListContainer'));
      return div.element(by.cssContainingText('.listItemPrimary',
        lexeme));
    },

    findEntryByDefinition: (definition: string) => {
      const div = this.editDiv.element(by.id('compactEntryListContainer'));
      return div.element(by.cssContainingText('.listItemSecondary',
        definition));
    },

    search: {
      input: this.editDivSearch.element(by.css('input')),
      clearBtn: this.editDivSearch.element(by.className('fa-times')),
      results: this.editDivSearch.all(by.repeater('e in typeahead.searchResults')),
      matchCountElem: this.editDivSearch.element(by.binding('typeahead.matchCountCaption')),
      getMatchCount: () => {
        // Inside this function, "this" == EditorPage.edit.search
        return this.edit.search.matchCountElem.getText().then((s: string) =>
          parseInt(s, 10)
        );
      }
    },

    // Top-row
    renderedDiv: this.editDiv.element(by.id('entryContainer')),
    deleteBtn: this.editDiv.element(by.id('deleteEntry')),

    // Helper functions for retrieving various field values
    fields: this.editDiv.all(by.repeater('fieldName in config.fieldOrder')),
    getLexemes: () => {

      // Returns lexemes in the format [{wsid: 'en', value: 'word'}, {wsid:
      // 'de', value: 'Wort'}]
      const lexeme = this.edit.fields.get(0);
      return editorUtil.dcMultitextToArray(lexeme);
    },

    getLexemesAsObject: () => {

      // Returns lexemes in the format [{en: 'word', de: 'Wort'}]
      const lexeme = this.edit.fields.get(0);
      return editorUtil.dcMultitextToObject(lexeme);
    },

    getFirstLexeme: () => {
      browser.wait(ExpectedConditions.visibilityOf(this.edit.fields.get(0)), CONDITION_TIMEOUT);

      // Returns the first (topmost) lexeme regardless of its wsid
      const lexeme = this.edit.fields.get(0);
      return editorUtil.dcMultitextToFirstValue(lexeme);
    },

    getLexemeByWsid: (searchWsid: string) => {
      const lexeme = this.edit.fields.get(0);
      return editorUtil.dcMultitextToObject(lexeme).then((lexemes: string) =>
        lexemes[searchWsid]
      );
    },

    audio: {
      players: (searchLabel: string) => {
        return editorUtil.getOneField(searchLabel).all(by.css('.player a'));
      },

      playerIcons: (searchLabel: string) => {
        return editorUtil.getOneField(searchLabel).all(by.css('.player a > i'));
      },

      moreControls: (searchLabel: string) => {
        return editorUtil.getOneField(searchLabel).all(by.css('.dc-audio a.dropdown-toggle'));
      },

      moreGroups: (searchLabel: string, index: number) => {
        const allMoreGroups = editorUtil.getOneField(searchLabel).all(by.css('.dc-audio .dropdown'));
        if (index !== undefined) {
          if (index < 0) index = 0;
          return allMoreGroups.get(index);
        }

        return allMoreGroups;
      },

      moreDownload: (searchLabel: string, index: number) => {
        return this.edit.audio.moreGroups(searchLabel, index).element(by.id('dc-audio-download'));
      },

      moreDelete: (searchLabel: string, index: number) => {
        return this.edit.audio.moreGroups(searchLabel, index).element(by.id('dc-audio-delete'));
      },

      moreUpload: (searchLabel: string, index: number) => {
        return this.edit.audio.moreGroups(searchLabel, index).element(by.id('dc-audio-upload'));
      },

      uploadButtons: (searchLabel: string) => {
        return editorUtil.getOneField(searchLabel).all(by.css('.dc-audio button.buttonAppend'));
      },

      uploadDropBoxes: (searchLabel: string) => {
        return editorUtil.getOneField(searchLabel).all(by.css('.drop-box'));
      },

      uploadCancelButtons: (searchLabel: string) => {
        return editorUtil.getOneField(searchLabel).all(by.css('.dc-audio i.fa-times'));
      },

      downloadButtons: (searchLabel: string) => {
        return editorUtil.getOneField(searchLabel).all(by.css('.dc-audio a.buttonAppend'));
      },

      control: (searchLabel: string, index: number) => {
        const mockUploadElement = editorUtil.getOneField(searchLabel).all(by.css('.dc-audio'))
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
        .all(by.css('.input-group > .dc-formattedtext .ta-bind')),
      removeImages: editorUtil.getOneField('Pictures').all(by.className('fa-trash')),
      getFileName: (index: number) => {
        return editorUtil.getOneFieldValue('Pictures').then((pictures: any) =>
          pictures[index].fileName
        );
      },

      getCaption: (index: number) => {
        return editorUtil.getOneFieldValue('Pictures').then((pictures: any) =>
          pictures[index].caption
        );
      },

      addPictureLink: element(by.id('dc-picture-add-btn')),
      addDropBox: editorUtil.getOneField('Pictures').element(by.css('.drop-box')),
      addCancelButton: element(by.id('addCancel'))
    },

    getMultiTextInputs: (searchLabel: string) => {
      return editorUtil.getOneField(searchLabel)
        .all(by.css('.input-group > .dc-formattedtext .ta-bind'));
    },

    getMultiTextInputSystems: (searchLabel: string) => {
      return editorUtil.getOneField(searchLabel).all(by.css('.input-group > span.wsid'));
    },

    selectElement: editorUtil.selectElement,
    getFields: editorUtil.getFields,
    getOneField: editorUtil.getOneField,
    getFieldValues: editorUtil.getFieldValues,
    getOneFieldValue: editorUtil.getOneFieldValue
  };

  // --- Comment view ---
  comment = {
    toEditLink: element(by.id('toEditLink')),

    bubbles: {
      first: element.all(by.css('.dc-entry .commentBubble')).get(0),
      second: element.all(by.css('.dc-entry .dc-sense .commentBubble')).get(0)
    },

    // Top-row UI elements
    renderedDiv: this.commentDiv.element(by.css('dc-rendered')),
    filter: {
      byTextElem: this.commentDiv.element(by.model('commentFilter.text')),
      byStatusElem: this.commentDiv.element(by.model('commentFilter.status')),
      clearElem: this.commentDiv.element(by.css('[title="Clear Filter] > i.fa-times')),
      byText: (textToFilterBy: string) => {
        this.comment.filter.byTextElem.sendKeys(textToFilterBy);
      },

      byStatus: (statusToFilterBy: string) => {
        utils.clickDropdownByValue(this.comment.filter.byStatusElem, statusToFilterBy);
      },

      clearByText: () => {
        this.comment.filter.clearElem.click();
      },

      clearByStatus: () => {
        this.comment.filter.byStatus('Show All');
      }
    },
    commentCountElem: this.commentDiv.element(by.binding('currentEntryCommentCounts.total')),
    getCommentCount: () => {
      return this.comment.commentCountElem.getText().then((s: string) =>
        parseInt(s, 10)
      );
    },

    // Left half of page: entry (with clickable elements)
    entry: {
      // We can just reuse the functions from dbeUtil, since they default to
      // using element(by.css('dc-entry')) as their root element.
      getFields: editorUtil.getFields,
      getOneField: editorUtil.getOneField,
      getFieldValues: editorUtil.getFieldValues,
      getOneFieldValue: editorUtil.getOneFieldValue,
      getOneFieldAllInputSystems: (searchLabel: string, idx: number = 0,
                                   rootElem: ElementFinder = element(by.className('dc-entry'))) => {
        return editorUtil.getOneField(searchLabel, idx, rootElem).all(by.css('span.wsid'));
      }
    },

    // Right half of page: comments
    newComment: {
      textarea: element(by.id('comment-panel-textarea')),
      postBtn: element(by.id('comment-panel-post-btn'))
    },
    commentsList: this.commentDiv.all(by.repeater('comment in currentEntryCommentsFiltered')),
    getComment: (commentNum: number) => {
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
  getComment(commentsList: ElementArrayFinder, commentNum: number = 0) {
    const comment = (commentNum === -1 ? commentsList.last() : commentsList.get(commentNum));
    return this.partsOfComment(comment);
  }

  // Like getComment, gets a specific reply from the list and returns its parts
  // (via partsOfReply() below)
  // replyNum can be -1 to get the last reply, any other number is a 0-based
  // indexgetO
  getReply(repliesList: ElementArrayFinder, replyNum: number) {
    if (typeof (replyNum) === 'undefined') {
      replyNum = 0;
    }

    const reply = (replyNum === -1 ? repliesList.last() : repliesList.get(replyNum));
    return this.partsOfReply(reply);
  }

  // Returns a Javascript object that can be used to access the parts (avatar,
  // reply button, etc.) of a comment
  // Usage example:
  // expect(partsOfDcComment(commentDiv).regarding.inputSystem).toBe("th")
  partsOfComment(div: ElementFinder) {
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
      score: div.element(by.css('.comment-interaction .likes')),
      plusOneActive: div.element(by.css('.comment-actions .can-like')),
      plusOneInactive: div.element(by.css('.comment-actions .liked')),
      plusOne: div.element(by.css('.comment-actions i.fa-thumbs-o-up:not(.ng-hide)')),

      // Right side content
      content: div.element(by.binding('comment.content')),
      contextGuid: div.element(by.binding('comment.contextGuid')),
      edit: {
        textarea: div.element(by.model('editingCommentContent')),
        updateBtn: div.element(by.buttonText('Update')),
        cancelLink: div.element(by.linkText('Cancel'))
      },
      regarding: {
        // NOTE: Any or all of these may be absent in a given comment. Use
        // isPresent() before calling expect().
        toggle: div.element(by.css('.comment-body > button')),
        container: div.element(by.css('.commentRegarding')),
        word: div.element(by.binding('comment.regarding.word')),
        definition: div.element(by.binding('comment.regarding.meaning')),
        fieldLabel: div.element(by.binding('comment.regarding.fieldNameForDisplay')),
        fieldWsid: div.element(by.binding('comment.regarding.inputSystem')),
        fieldValue: div.element(by.css('.regardingFieldValue'))
      },

      // Replies (below content but above bottom controls)
      replies,
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
  }

  // Like partsOfComment, returns a Javascript object giving access to the parts
  // of a reply
  partsOfReply(div: ElementFinder) {
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
  }
}
