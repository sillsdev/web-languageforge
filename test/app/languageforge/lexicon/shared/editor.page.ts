import {browser, by, element, ExpectedConditions} from 'protractor';

import {ElementArrayFinder, ElementFinder} from 'protractor/built/element';
import {MockUploadElement} from '../../../bellows/shared/mock-upload.element';
import {Utils} from '../../../bellows/shared/utils';
import {EditorUtil} from './editor.util';
import {LexModals} from './lex-modals.util';

export class EditorPage {
  private readonly mockUpload = new MockUploadElement();
  private readonly editorUtil = new EditorUtil();

  modal = new LexModals();

  static get(projectId: string, entryId: string) {
    let extra = projectId ? ('/' + projectId) : '';
    extra += (projectId && entryId) ? ('#!/editor/entry/' + entryId) : '';
    browser.get(browser.baseUrl + '/app/lexicon' + extra);
  }

  static getProjectIdFromUrl() {
    return browser.getCurrentUrl().then(url => {
      const match = url.match(/\/app\/lexicon\/([0-9a-z]{24})/);
      let projectId = '';
      if (match) {
        projectId = match[1];
      }

      return projectId;
    });
  }

  static getEntryIdFromUrl() {
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
  editDiv = element(by.id('lexAppEditView'));
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
      browser.wait(ExpectedConditions.visibilityOf(this.browse.entryCountElem), Utils.conditionTimeout);
      return this.browse.entryCountElem.getText().then((s: string) =>
        parseInt(/(\d+)$/.exec(s)[1], 10)
      );
    },

    // Search/filter
    search: {
      input: this.browseDiv.element(by.id('editor-list-search-entries')),
      clearBtn: this.browseDiv.element(by.className('clear-search-button')),
      getMatchCount: () => {
        // Inside this function, "this" ==  EditorPage.browse.search
        return this.browse.entryCountElem.getText().then((s: string) =>
          parseInt(/^(\d+)/.exec(s)[1], 10)
        );
      }
    },

    // Entries list (main body of view)
    entriesList: this.browseDiv.all(by.repeater('entry in $ctrl.visibleEntries track by entry.id')),
    findEntryByLexeme: (lexeme: string) => {
      browser.wait(ExpectedConditions.visibilityOf(
        element(by.id('lexAppListView'))), Utils.conditionTimeout);
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
          Utils.scrollTop();
          this.edit.toggleHiddenFieldsBtn.click();
        }
      });
    },

    hideHiddenFields: () => {
      // Only click the button if it will result in fields being hidden
      this.edit.toggleHiddenFieldsBtn.getText().then((text: string) => {
        if (text === this.edit.toggleHiddenFieldsBtnText.hide) {
          Utils.scrollTop();
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

    entriesList: this.editDiv.all(by.repeater('entry in $ctrl.visibleEntries')),
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
      input: this.editDiv.element(by.id('editor-entry-search-entries')),
      clearBtn: this.editDiv.element(by.className('clear-search-button')),
      entryCountElem: this.editDiv.element(by.id('totalNumberOfEntries')),
      getMatchCount: () => {
        // Inside this function, "this" == EditorPage.edit.search
        return this.edit.search.entryCountElem.getText().then((s: string) =>
          parseInt(/^(\d+)/.exec(s)[1], 10)
        );
      }
    },

    // Top-row
    renderedDiv: this.editDiv.element(by.className('dc-rendered-entryContainer')),
    actionMenu: this.editDiv.element(by.css('.entry-card .card-header .ellipsis-menu-toggle')),
    deleteMenuItem: this.editDiv.element(by.css('.entry-card .card-header .dropdown-menu .dropdown-item')),

    // Helper functions for retrieving various field values
    fields: this.editDiv.all(by.repeater('fieldName in $ctrl.config.fieldOrder')),
    getLexemes: () => {

      // Returns lexemes in the format [{wsid: 'en', value: 'word'}, {wsid:
      // 'de', value: 'Wort'}]
      const lexeme = this.edit.fields.get(0);
      return this.editorUtil.dcMultitextToArray(lexeme);
    },

    getLexemesAsObject: () => {

      // Returns lexemes in the format [{en: 'word', de: 'Wort'}]
      const lexeme = this.edit.fields.get(0);
      return this.editorUtil.dcMultitextToObject(lexeme);
    },

    getFirstLexeme: () => {
      browser.wait(ExpectedConditions.visibilityOf(this.edit.fields.get(0)), Utils.conditionTimeout);

      // Returns the first (topmost) lexeme regardless of its wsid
      const lexeme = this.edit.fields.get(0);
      return this.editorUtil.dcMultitextToFirstValue(lexeme);
    },

    getLexemeByWsid: (searchWsid: string) => {
      const lexeme = this.edit.fields.get(0);
      return this.editorUtil.dcMultitextToObject(lexeme).then((lexemes: string) =>
        lexemes[searchWsid]
      );
    },

    getFieldLabel: (fieldIndex: number) => {
      return this.edit.fields.get(fieldIndex).all(by.tagName('label')).get(0);
    },

    audio: {
      players: (searchLabel: string) => {
        return EditorUtil.getOneField(searchLabel).all(by.css('.player a'));
      },

      playerIcons: (searchLabel: string) => {
        return EditorUtil.getOneField(searchLabel).all(by.css('.player a > i'));
      },

      moreControls: (searchLabel: string) => {
        return EditorUtil.getOneField(searchLabel).all(by.css('.dc-audio a.dropdown-toggle'));
      },

      moreGroups: (searchLabel: string, index: number) => {
        const allMoreGroups = EditorUtil.getOneField(searchLabel).all(by.css('.dc-audio .dropdown'));
        if (index !== undefined) {
          if (index < 0) index = 0;
          return allMoreGroups.get(index);
        }

        return allMoreGroups;
      },

      moreDownload: (searchLabel: string, index: number) => {
        return this.edit.audio.moreGroups(searchLabel, index).element(by.className('dc-audio-download'));
      },

      moreDelete: (searchLabel: string, index: number) => {
        return this.edit.audio.moreGroups(searchLabel, index).element(by.className('dc-audio-delete'));
      },

      moreUpload: (searchLabel: string, index: number) => {
        return this.edit.audio.moreGroups(searchLabel, index).element(by.className('dc-audio-upload'));
      },

      uploadButtons: (searchLabel: string) => {
        return EditorUtil.getOneField(searchLabel).all(by.css('.dc-audio .upload-audio'));
      },

      uploadDropBoxes: (searchLabel: string) => {
        return EditorUtil.getOneField(searchLabel).all(by.css('.drop-box'));
      },

      uploadCancelButtons: (searchLabel: string) => {
        return EditorUtil.getOneField(searchLabel).all(by.css('.dc-audio i.fa-times'));
      },

      downloadButtons: (searchLabel: string) => {
        return EditorUtil.getOneField(searchLabel).all(by.css('.dc-audio a.buttonAppend'));
      },

      control: (searchLabel: string, index: number) => {
        const mockUploadElement = EditorUtil.getOneField(searchLabel).all(by.css('.dc-audio')).get(index);
        mockUploadElement.mockUpload = this.mockUpload;
        return mockUploadElement;
      }
    },

    senses: element.all(by.css('dc-sense')),

    sense: {
      actionMenus: this.editDiv.all(by.css('dc-sense .ellipsis-menu-toggle')),
      deleteSense: this.editDiv.all(by.css('dc-sense .ellipsis-menu-toggle ~ .dropdown-menu fa-trash')),
      moveUp: this.editDiv.all(by.css('dc-sense .ellipsis-menu-toggle ~ .dropdown-menu .fa-arrow-up')),
      moveDown: this.editDiv.all(by.css('dc-sense .ellipsis-menu-toggle ~ .dropdown-menu .fa-arrow-down'))
    },

    pictures: {
      list: EditorUtil.getOneField('Pictures'),
      images: EditorUtil.getOneField('Pictures').all(by.css('img')),
      captions: EditorUtil.getOneField('Pictures')
        .all(by.css('.input-group > .dc-text input')),
      removeImages: EditorUtil.getOneField('Pictures').all(by.className('fa-trash')),
      getFileName: (index: number) => {
        return this.editorUtil.getOneFieldValue('Pictures').then((pictures: any) =>
          pictures[index].fileName
        );
      },

      getCaption: (index: number) => {
        return this.editorUtil.getOneFieldValue('Pictures').then((pictures: any) =>
          pictures[index].caption
        );
      },

      addPictureLink: element(by.id('dc-picture-add-btn')),
      addDropBox: EditorUtil.getOneField('Pictures').element(by.css('.drop-box')),
      addCancelButton: element(by.id('addCancel'))
    },

    semanticDomain: {
      values: EditorUtil.getOneField('Semantic Domain').all(by.className('dc-semanticdomain-value'))
    },

    getMultiTextInputs: (searchLabel: string) => {
      return EditorUtil.getOneField(searchLabel)
        .all(by.css('.input-group > .dc-text input'));
    },

    getMultiTextInputSystems: (searchLabel: string) => {
      return EditorUtil.getOneField(searchLabel).all(by.css('.input-group > span.wsid'));
    },

    selectElement: this.editorUtil.selectElement,
    getFields: EditorUtil.getFields,
    getOneField: EditorUtil.getOneField,
    getFieldValues: this.editorUtil.getFieldValues,
    getOneFieldValue: this.editorUtil.getOneFieldValue
  };

  // --- Comment view ---
  comment = {
    toEditLink: element(by.id('toEditLink')),

    bubbles: {
      first: element.all(by.css('.dc-entry .commentBubble')).get(1),
      second: element.all(by.css('.dc-entry .dc-sense .commentBubble')).get(1)
    },

    // Top-row UI elements
    renderedDiv: this.commentDiv.element(by.css('dc-rendered')),
    filter: {
      byTextElem: this.commentDiv.element(by.model('$ctrl.commentFilter.text')),
      byStatusElem: this.commentDiv.element(by.model('$ctrl.commentFilter.status')),
      clearElem: this.commentDiv.element(by.css('[title="Clear Filter] > i.fa-times')),
      byText: (textToFilterBy: string) => {
        this.comment.filter.byTextElem.sendKeys(textToFilterBy);
      },

      byStatus: (statusToFilterBy: string) => {
        Utils.clickDropdownByValue(this.comment.filter.byStatusElem, statusToFilterBy);
      },

      clearByText: () => {
        this.comment.filter.clearElem.click();
      },

      clearByStatus: () => {
        this.comment.filter.byStatus('Show All');
      }
    },

    // Left half of page: entry (with clickable elements)
    entry: {
      // We can just reuse the functions from dbeUtil, since they default to
      // using element(by.css('dc-entry')) as their root element.
      getFields: EditorUtil.getFields,
      getOneField: EditorUtil.getOneField,
      getFieldValues: this.editorUtil.getFieldValues,
      getOneFieldValue: this.editorUtil.getOneFieldValue,
      getOneFieldAllInputSystems: (searchLabel: string, idx: number = 0,
                                   rootElem: ElementFinder = element(by.className('dc-entry'))) => {
        return EditorUtil.getOneField(searchLabel, idx, rootElem).all(by.css('span.wsid'));
      }
    },

    // Right half of page: comments
    newComment: {
      textarea: element(by.id('comment-panel-textarea')),
      postBtn: element(by.id('comment-panel-post-button'))
    },
    commentsList: this.commentDiv.all(by.repeater('comment in $ctrl.currentEntryCommentsFiltered')),
    getComment: (commentNum: number) => {
      return EditorPage.getComment(this.comment.commentsList, commentNum);
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
  static getComment(commentsList: ElementArrayFinder, commentNum: number = 0) {
    const comment = (commentNum === -1 ? commentsList.last() : commentsList.get(commentNum));
    return EditorPage.partsOfComment(comment);
  }

  // Like getComment, gets a specific reply from the list and returns its parts
  // (via partsOfReply() below)
  // replyNum can be -1 to get the last reply, any other number is a 0-based
  // indexgetO
  static getReply(repliesList: ElementArrayFinder, replyNum: number) {
    if (typeof (replyNum) === 'undefined') {
      replyNum = 0;
    }

    const reply = (replyNum === -1 ? repliesList.last() : repliesList.get(replyNum));
    return EditorPage.partsOfReply(reply);
  }

  // Returns a Javascript object that can be used to access the parts (avatar,
  // reply button, etc.) of a comment
  // Usage example:
  // expect(partsOfDcComment(commentDiv).regarding.inputSystem).toBe("th")
  static partsOfComment(div: ElementFinder) {
    const replies = div.all(by.repeater('reply in $ctrl.comment.replies')); // used in
    // getReply()
    // below
    return {
      wholeComment: div,

      // Left side controls
      // avatar:
      // div.element(by.binding('model.authorInfo.createdByUserRef.avatar_ref')),
      avatar: div.element(by.css('.comment-footer img')),
      author: div.element(by.binding('$ctrl.comment.authorInfo.createdByUserRef.name')),
      date: div.element(by.binding('$ctrl.comment.authorInfo.createdDate | relativetime')),
      score: div.element(by.css('.comment-interaction .likes')),
      plusOneActive: div.element(by.css('.comment-actions .can-like')),
      plusOneInactive: div.element(by.css('.comment-actions .liked')),
      plusOne: div.element(by.css('.comment-actions i.fa-thumbs-o-up:not(.ng-hide)')),

      // Right side content
      content: div.element(by.binding('$ctrl.comment.content')),
      contextGuid: div.element(by.binding('$ctrl.comment.contextGuid')),
      edit: {
        textarea: div.element(by.model('$ctrl.editingCommentContent')),
        updateBtn: div.element(by.buttonText('Update')),
        cancelLink: div.element(by.linkText('Cancel'))
      },
      regarding: {
        // NOTE: Any or all of these may be absent in a given comment. Use
        // isPresent() before calling expect().
        toggle: div.element(by.css('.comment-body > button')),
        container: div.element(by.css('.commentRegarding')),
        fieldValue: div.element(by.css('.regardingFieldValue'))
      },

      // Replies (below content but above bottom controls)
      replies,
      getReply(replyNum: number) {
        return EditorPage.getReply(replies, replyNum);
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
  static partsOfReply(div: ElementFinder) {
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
