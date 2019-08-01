import * as angular from 'angular';

import {ActivityService} from '../../../bellows/core/api/activity.service';
import {ApplicationHeaderService} from '../../../bellows/core/application-header.service';
import {HelpHeroService} from '../../../bellows/core/helphero.service';
import {ModalService} from '../../../bellows/core/modal/modal.service';
import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {EditorDataService} from '../../../bellows/core/offline/editor-data.service';
import {LexiconCommentService} from '../../../bellows/core/offline/lexicon-comments.service';
import {SessionService} from '../../../bellows/core/session.service';
import {InterfaceConfig} from '../../../bellows/shared/model/interface-config.model';
import {SemanticDomainsService} from '../../core/semantic-domains/semantic-domains.service';
import {LexiconEntryApiService} from '../core/lexicon-entry-api.service';
import {LexiconProjectService} from '../core/lexicon-project.service';
import {LexiconRightsService, Rights} from '../core/lexicon-rights.service';
import {LexiconSendReceiveService} from '../core/lexicon-send-receive.service';
import {LexiconUtilityService} from '../core/lexicon-utility.service';
import {LexEntry} from '../shared/model/lex-entry.model';
import {LexPicture} from '../shared/model/lex-picture.model';
import {
  LexConfig,
  LexConfigField,
  LexConfigFieldList,
  LexConfigMultiText, LexConfigOptionList,
  LexiconConfig
} from '../shared/model/lexicon-config.model';
import {LexiconProject} from '../shared/model/lexicon-project.model';
import {FieldControl} from './field/field-control.model';
import {LexOptionList} from '../shared/model/option-list.model';

class SortOption {
  label: string;
  value: string;
}

class FilterOption {
  inputSystem?: string;
  key: string;
  label: string;
  level?: string;
  type: string;
  value: string;
}

class Show {
  more: () => void;
  emptyFields: boolean = false;
  entryListModifiers: boolean = false;
}

export class LexiconEditorController implements angular.IController {
  lecConfig: LexiconConfig;
  lecInterfaceConfig: InterfaceConfig;
  lecFinishedLoading: boolean;
  lecProject: LexiconProject;
  lecOptionLists: LexOptionList[];
  lecRights: Rights;

  lastSavedDate = new Date();
  currentEntry: LexEntry = new LexEntry();
  commentContext = {
    contextGuid: ''
  };
  rightPanelVisible = false;
  show: Show = new Show();
  // status is tri-state: unsaved, saving, saved
  saveStatus = 'unsaved';

  autoSaveTimer: angular.IPromise<void>;
  control: FieldControl = new FieldControl();

  entries = this.editorService.entries;
  entryListModifiers = this.editorService.entryListModifiers;
  filteredEntries = this.editorService.filteredEntries;
  getEntryCommentCount = this.commentService.getEntryCommentCount.bind(this.commentService);
  getPrimaryListItemForDisplay = this.editorService.getSortableValue;
  visibleEntries = this.editorService.visibleEntries;
  unreadCount = this.activityService.unreadCount;

  private pristineEntry: LexEntry = new LexEntry();
  private warnOfUnsavedEditsId: string;

  static $inject = ['$filter', '$interval',
    '$q', '$scope',
    '$state',
    '$window',
    'activityService',
    'applicationHeaderService',
    'modalService', 'silNoticeService',
    'sessionService', 'semanticDomainsService',
    'lexCommentService', 'lexEditorDataService',
    'lexEntryApiService',
    'lexProjectService',
    'lexRightsService',
    'lexSendReceive',
    'helpHeroService'
  ];

  constructor(private readonly $filter: angular.IFilterService,
              private readonly $interval: angular.IIntervalService,
              private readonly $q: angular.IQService,
              private readonly $scope: angular.IScope,
              private readonly $state: angular.ui.IStateService,
              private readonly $window: angular.IWindowService,
              private readonly activityService: ActivityService,
              private readonly applicationHeaderService: ApplicationHeaderService,
              private readonly modal: ModalService,
              private readonly notice: NoticeService,
              private readonly sessionService: SessionService,
              private readonly semanticDomains: SemanticDomainsService,
              private readonly commentService: LexiconCommentService,
              private readonly editorService: EditorDataService,
              private readonly lexService: LexiconEntryApiService,
              private readonly lexProjectService: LexiconProjectService,
              private readonly rightsService: LexiconRightsService,
              private readonly sendReceive: LexiconSendReceiveService,
              private readonly helpHeroService: HelpHeroService) {}

  $onInit(): void {
    this.show.more = this.editorService.showMoreEntries;

    this.$scope.$watch(() => this.lecConfig, () => {
      this.setSortAndFilterOptionsFromConfig();
    });
    this.initFilterAndSearchOptions();

    this.sendReceive.setPollUpdateSuccessCallback(this.pollUpdateSuccess);
    this.sendReceive.setSyncProjectStatusSuccessCallback(this.syncProjectStatusSuccess);

    this.$scope.$on('$locationChangeStart', (event, next, current) => {
      if (current.includes('#!/editor/entry') && !next.includes('#!/editor/entry')) {
        this.cancelAutoSaveTimer();
        this.saveCurrentEntry();
      }
    });

    this.$window.onbeforeunload = () => {
      if (this.hasUnsavedChanges()) {
        this.saveCurrentEntry();
      }
    };

    this.show.entryListModifiers = !(this.$window.localStorage.getItem('viewFilter') == null ||
      this.$window.localStorage.getItem('viewFilter') === 'false');
  }

  $onChanges(changes: any): void {
    const finishedLoadingChange = changes.lecFinishedLoading as angular.IChangesObject<boolean>;
    if (finishedLoadingChange != null && this.lecFinishedLoading) {
      this.control = {
        interfaceConfig: this.lecInterfaceConfig,
        commentContext: this.commentContext,
        config: this.lecConfig,
        currentEntry: this.currentEntry,
        deleteEntry: this.deleteEntry,
        getContextParts: this.getContextParts,
        hideRightPanel: this.hideRightPanel,
        makeValidModelRecursive: this.makeValidModelRecursive,
        project: this.lecProject,
        saveCurrentEntry: this.saveCurrentEntry,
        setCommentContext: this.setCommentContext,
        show: this.show,
        showCommentsPanel: this.showCommentsPanel,
        rightPanelVisible: this.rightPanelVisible,
        rights: this.lecRights
      } as FieldControl;
      this.evaluateState();
      this.helpHeroService.setProperty({hasEntries: this.entries.length > 0});
    }

    const configChange = changes.lecConfig as angular.IChangesObject<LexiconConfig>;
    if (configChange != null && configChange.currentValue != null) {
      this.control.config = this.lecConfig;
    }

    const interfaceConfigChange = changes.lecInterfaceConfig as angular.IChangesObject<InterfaceConfig>;
    if (interfaceConfigChange != null && interfaceConfigChange.currentValue != null) {
      this.control.interfaceConfig = this.lecInterfaceConfig;
    }

    const projectChange = changes.lecProject as angular.IChangesObject<LexiconProject>;
    if (projectChange != null && projectChange.currentValue != null) {
      this.control.project = this.lecProject;
      this.applicationHeaderService.setPageName(this.lecProject.projectName);
    }

    const rightsChange = changes.lecRights as angular.IChangesObject<Rights>;
    if (rightsChange != null && rightsChange.currentValue != null) {
      this.control.rights = this.lecRights;

      // conditionally register watch
      if (this.lecRights.canEditEntry()) {
        this.$scope.$watch(() => this.currentEntry, newValue => {
          if (newValue !== undefined) {
            this.cancelAutoSaveTimer();
            if (this.hasUnsavedChanges()) {
              this.startAutoSaveTimer();
            }
          }
        }, true);
      }
    }
  }

  $onDestroy(): void {
    this.cancelAutoSaveTimer();
    this.saveCurrentEntry();
  }

  navigateToLiftImport(): void {
    this.$state.go('importExport');
  }

  returnToList(): void {
    this.saveCurrentEntry();
    this.setCurrentEntry();
    this.$state.go('editor.list', {
      sortBy: this.$state.params.sortBy,
      filterText: this.$state.params.filterText,
      sortReverse: this.$state.params.sortReverse,
      filterType: this.$state.params.filterType,
      filterBy: this.$state.params.filterBy
    }, {notify: true});
  }

  isAtEditorList(): boolean {
    return LexiconUtilityService.isAtEditorList(this.$state);
  }

  isAtEditorEntry(): boolean {
    return LexiconUtilityService.isAtEditorEntry(this.$state);
  }

  toggleFilterOptions() {
    if (this.$window.localStorage.getItem('viewFilter') == null ||
      this.$window.localStorage.getItem('viewFilter') === 'false'
    ) {
      this.$window.localStorage.setItem('viewFilter', 'true');
      this.show.entryListModifiers = true;
    } else {
      this.$window.localStorage.setItem('viewFilter', 'false');
      this.show.entryListModifiers = false;
    }
  }

  initFilterAndSearchOptions(): void {
    const clear = this.$scope.$watch(() => this.entryListModifiers.sortOptions.length > 0, (ready: boolean) => {
      if (!ready) return;
      clear(); // remove the watcher

      if (this.$state.params.sortBy) {
        this.entryListModifiers.sortBy =
        this.setSelectedFilter(this.entryListModifiers.sortOptions, this.$state.params.sortBy)[0];
      }
      this.entryListModifiers.sortReverse = this.$state.params.sortReverse === 'true';

      if (this.$state.params.filterType) {
        this.entryListModifiers.filterType = this.$state.params.filterType;
      }
      if (this.$state.params.filterBy || this.$state.params.filterText) {
        this.entryListModifiers.filterBy = {
          text: this.$state.params.filterText,
          option: this.$state.params.filterBy ?
                  this.setSelectedFilter(this.entryListModifiers.filterOptions, this.$state.params.filterBy)[0] : null
        };
      }

      this.filterAndSortEntries();
    });
  }

  filterAndSortEntries(): void {
    this.$state.go('.', {
      sortBy: this.entryListModifiers.sortBy.label,
      filterText: this.entryListModifiers.filterText(),
      sortReverse: this.entryListModifiers.sortReverse,
      filterType: this.entryListModifiers.filterType,
      filterBy: this.entryListModifiers.filterByLabel()
    }, { notify: false });
    this.editorService.filterAndSortEntries.apply(this, arguments);
  }

  resetEntryListFilter(): void {
    this.entryListModifiers.filterBy = null;
    this.entryListModifiers.sortReverse = false;
    this.filterAndSortEntries();
  }

  hasUnsavedChanges(): boolean {
    if (!this.entryLoaded()) {
      return false;
    }
    return !angular.equals(this.currentEntry, this.pristineEntry);
  }

  entryLoaded(): boolean {
    return this.currentEntry.id != null;
  }

  saveCurrentEntry = (doSetEntry: boolean = false, successCallback: () => void = () => { },
                      failCallback: (reason?: any) => void = () => { }) => {
    // `doSetEntry` is mainly used for when the save button is pressed, that is when the user is saving the current
    // entry and is NOT going to a different entry (as is the case with editing another entry.
    let isNewEntry = false;
    let newEntryTempId: string;

    if (this.hasUnsavedChanges() && this.lecRights.canEditEntry()) {
      this.cancelAutoSaveTimer();
      this.sendReceive.setStateUnsynced();
      this.saveStatus = 'saving';
      this.currentEntry = LexiconEditorController.normalizeStrings(this.currentEntry);
      this.control.currentEntry = this.currentEntry;
      const entryToSave = angular.copy(this.currentEntry);
      if (LexiconEditorController.entryIsNew(entryToSave)) {
        isNewEntry = true;
        newEntryTempId = entryToSave.id;
        entryToSave.id = ''; // send empty id to indicate "create new"
      }

      return this.$q.all({
        entry: this.lexService.update(this.prepEntryForUpdate(entryToSave)),
        isSR: this.sendReceive.isSendReceiveProject()
      }).then(data => {
        const entry = data.entry.data;
        if (!entry && data.isSR) {
          this.warnOfUnsavedEdits(entryToSave);
          this.sendReceive.startSyncStatusTimer();
        }

        if (!entry) {
          this.resetEntryLists(this.currentEntry.id, angular.copy(this.pristineEntry));
        }

        if (isNewEntry) {
          // note: we have to reset the show window, because we don't know
          // where the new entry will show up in the list
          // we can solve this problem by implementing a sliding "scroll
          // window" that only shows a few entries at a time (say 30?)
          this.editorService.showInitialEntries();
        }

        /*
        * Reviewed CP 2014-08: It seems that currently the setCurrentEntry
        * will never do anything. Currently it has the side effect of causing
        * the focus to be lost. Given that we save the entire model We will
        * never get data returned other than what we just caused to be saved.
        *
        * One day we hope to send deltas which will fix this problem and give
        * a better real time experience.
        */

        /* Reviewed CJH 2015-03: setCurrentEntry is useful in the case when the entry being
        * saved is a new entry. In this case the new entry is replaced entirely by the one
        * returned from the server (with a proper id, etc).
        * I'm currently unclear on whether the doSetEntry parameter is still necessary
        */

        if (entry) {
          this.pristineEntry = angular.copy(entryToSave);
          this.lastSavedDate = new Date();
        }

        // refresh data will add the new entry to the entries list
        this.editorService.refreshEditorData().then(() => {
          this.activityService.markRefreshRequired();
          if (entry && isNewEntry) {
            this.setCurrentEntry(this.entries[this.editorService.getIndexInList(entry.id, this.entries)]);
            this.editorService.removeEntryFromLists(newEntryTempId);
            if (doSetEntry) {
              this.$state.go('.', {
                entryId: entry.id,
                sortBy: this.entryListModifiers.sortBy.label,
                filterText: this.entryListModifiers.filterText(),
                sortReverse: this.entryListModifiers.sortReverse,
                filterType: this.entryListModifiers.filterType,
                filterBy: this.entryListModifiers.filterByLabel()
              }, { notify: false });
              this.scrollListToEntry(entry.id, 'top');
            }
          }
        });

        this.saveStatus = 'saved';
        successCallback();
      }).catch(reason => {
        this.saveStatus = 'unsaved';
        failCallback(reason);
      });
    } else {
      successCallback();
    }
  }

  editEntryAndScroll(id: string): void {
    this.editEntry(id);
    this.scrollListToEntry(id, 'middle');
  }

  editEntry(id: string): void {
    if (this.currentEntry.id !== id) {
      this.saveCurrentEntry();
      this.setCurrentEntry(this.entries[this.editorService.getIndexInList(id, this.entries)]);
      // noinspection JSIgnoredPromiseFromCall - comments will load in the background
      this.commentService.loadEntryComments(id);
      if (this.rightPanelVisible === true && this.commentContext.contextGuid !== '') {
        this.showComments();
        this.setCommentContext('');
      }
    }

    this.goToEntry(id);
  }

  canSkipToEntry(distance: number): boolean {
    const i = this.editorService.getIndexInList(this.currentEntry.id, this.visibleEntries) + distance;
    return i >= 0 && i < this.visibleEntries.length;
  }

  skipToEntry(distance: number): void {
    const i = this.editorService.getIndexInList(this.currentEntry.id, this.visibleEntries) + distance;
    this.editEntry(this.visibleEntries[i].id);
  }

  newEntry(): void {
    this.saveCurrentEntry(false, () => {
      const d = new Date();
      const uniqueId = '_new_' + d.getSeconds() + d.getMilliseconds();
      const newEntry = new LexEntry();
      newEntry.id = uniqueId;
      this.setCurrentEntry(newEntry);
      // noinspection JSIgnoredPromiseFromCall - comments will load in the background
      this.commentService.loadEntryComments(newEntry.id);
      this.editorService.addEntryToEntryList(newEntry);
      this.editorService.showInitialEntries().then(() => {
        this.scrollListToEntry(newEntry.id, 'top');
      });

      this.goToEntry(newEntry.id);
      this.hideRightPanel();
    });
  }

  deleteEntry = (entry: LexEntry): void => {
    const deleteMsg = 'Are you sure you want to delete the entry <b>\'' +
      LexiconUtilityService.getLexeme(this.lecConfig, this.lecConfig.entry, entry) + '\'</b>';
    this.modal.showModalSimple('Delete Entry', deleteMsg, 'Cancel', 'Delete Entry').then(() => {
      let iShowList = this.editorService.getIndexInList(entry.id, this.visibleEntries);
      this.editorService.removeEntryFromLists(entry.id);
      if (this.entries.length > 0) {
        if (iShowList !== 0) {
          iShowList--;
        }
        this.setCurrentEntry(this.visibleEntries[iShowList]);
        this.$state.go('.', {
          entryId: this.visibleEntries[iShowList].id,
          sortBy: this.entryListModifiers.sortBy.label,
          filterText: this.entryListModifiers.filterText(),
          sortReverse: this.entryListModifiers.sortReverse,
          filterType: this.entryListModifiers.filterType,
          filterBy: this.entryListModifiers.filterByLabel()
        }, { notify: false });
      } else {
        this.returnToList();
      }

      if (!LexiconEditorController.entryIsNew(entry)) {
        this.sendReceive.setStateUnsynced();
        this.lexService.remove(entry.id, () => {
          this.editorService.refreshEditorData();
        });
      }

      this.hideRightPanel();
    }, () => { });
  }

  makeValidModelRecursive = (config: LexConfigField, data: any = {}, stopAtNodes: string | string[] = []): any => {
    if (typeof stopAtNodes === 'string') {
      stopAtNodes = [stopAtNodes];
    }

    switch (config.type) {
      case 'fields':
        const configFieldList = config as LexConfigFieldList;
        for (const fieldName of configFieldList.fieldOrder) {
          if (data[fieldName] == null) {
            if (configFieldList.fields[fieldName].type === 'fields' ||
              configFieldList.fields[fieldName].type === 'pictures'
            ) {
              data[fieldName] = [];
            } else {
              data[fieldName] = {};
            }
          }

          // only recurse if the field is not in our node stop list or if it contains data
          if (stopAtNodes.indexOf(fieldName) === -1 || data[fieldName].length !== 0) {
            if (configFieldList.fields[fieldName].type === 'fields') {
              if (data[fieldName].length === 0) {
                data[fieldName].push({});
              }

              for (let i = 0; i < data[fieldName].length; i++) {
                data[fieldName][i] =
                  this.makeValidModelRecursive(configFieldList.fields[fieldName], data[fieldName][i], stopAtNodes);
              }
            } else {
              data[fieldName] =
                this.makeValidModelRecursive(configFieldList.fields[fieldName], data[fieldName], stopAtNodes);
            }
          }
        }
        break;
      case 'multitext':
        // when a multitext is completely empty for a field, and sent down the wire, it will come as a [] because of the
        // way that the PHP JSON default encode works. We change this to be {} for an empty multitext
        if (angular.isArray(data)) {
          data = {};
        }

        for (const inputSystemTag of (config as LexConfigMultiText).inputSystems) {
          if (data[inputSystemTag] == null) {
            data[inputSystemTag] = {
              value: ''
            };
          }
        }
        break;
      case 'optionlist':
        if (data.value == null || data.value === null) {
          data.value = '';
          const configOptionList = config as LexConfigOptionList;
          if (this.lecConfig.optionlists != null && configOptionList.listCode != null &&
            (configOptionList.listCode in this.lecConfig.optionlists) &&
            this.lecConfig.optionlists[configOptionList.listCode].defaultItemKey != null
          ) {
            data.value = this.lecConfig.optionlists[configOptionList.listCode].defaultItemKey;
          }
        }

        break;
      case 'multioptionlist':
        if (data.values == null) {
          data.values = [];
        }

        break;
      case 'pictures':
        const captionConfig = angular.copy(config);
        captionConfig.type = 'multitext';
        if (data == null) {
          data = [];
        }

        for (const picture of data as LexPicture[]) {
          if (picture.caption == null) {
            picture.caption = {};
          }

          picture.caption = this.makeValidModelRecursive(captionConfig, picture.caption);
        }
        break;
      case 'multiparagraph':
        if (data.type == null) {
          data.type = 'multiparagraph';
        }

        if (data.paragraphsHtml == null) {
          data.paragraphsHtml = '';
        }

        break;
    }

    // console.log('end data: ', data);
    return data;
  }

  getWordForDisplay(entry: LexEntry): string {
    const lexeme: string = LexiconUtilityService.getLexeme(this.lecConfig, this.lecConfig.entry, entry);
    if (!lexeme) {
      return '[Empty]';
    }

    return lexeme;
  }

  getMeaningForDisplay(entry: LexEntry): string {
    let meaning = '';
    if (entry.senses && entry.senses[0]) {
      meaning = LexiconUtilityService.getMeaning(this.lecConfig,
        this.lecConfig.entry.fields.senses as LexConfigFieldList, entry.senses[0]);
    }

    if (!meaning) {
      return '[Empty]';
    }

    return meaning;
  }

  getCompactItemListOverlay(entry: LexEntry): string {
    let title;
    let subtitle;
    title = this.getWordForDisplay(entry);
    subtitle = this.getMeaningForDisplay(entry);
    if (title.length > 19 || subtitle.length > 25) {
      return title + '         ' + subtitle;
    } else {
      return '';
    }
  }

  // Comments View
  showComments(): void {
    if (this.rightPanelVisible === true && this.commentContext.contextGuid === '') {
      this.showCommentsPanel();

      // Reset the comment context AFTER the panel starts hiding
      this.setCommentContext('');
    } else {
      // Reset the comment context BEFORE we start showing the panel
      this.setCommentContext('');
      const commentsRightPanel = document.querySelector('.comments-right-panel') as HTMLElement;
      commentsRightPanel.style.paddingTop = '0';
      if (this.rightPanelVisible === false) {
        this.showCommentsPanel();
      }
    }
  }

  showCommentsPanel = (): void => {
    this.showRightPanel('#lexAppCommentView');
  }

  showActivityFeed = (): void => {
    // Ideally this would automatically happen when activity is added but not possible yet
    this.activityService.markRefreshRequired();
    this.showRightPanel('#lexAppActivityFeed');
  }

  showRightPanel(element: string): void {
    const currentElement = document.querySelector(element);
    if (this.rightPanelVisible === false) {
      this.rightPanelVisible = true;
      this.control.rightPanelVisible = this.rightPanelVisible;
      currentElement.classList.add('panel-visible');
    } else if (this.rightPanelVisible === true) {
      if (currentElement.classList.contains('panel-visible')) {
        this.hideRightPanel();
      } else {
        const visibleElement = document.querySelector('.panel-visible');
        visibleElement.classList.remove('panel-visible');
        visibleElement.classList.add('panel-closing', 'panel-switch');
        currentElement.classList.add('panel-visible');
        this.$interval(() => {
          document.querySelector('.panel-closing').classList.remove('panel-closing', 'panel-switch');
        }, 500, 1);
      }
    }
  }

  hideRightPanel = (): void => {
    if (this.rightPanelVisible === true) {
      this.rightPanelVisible = null;
      this.control.rightPanelVisible = this.rightPanelVisible;

      // Delay relates to the CSS timer for mobile vs > tablet
      const delay = (screen.availWidth >= 768) ? 1500 : 500;
      const visibleElement = document.querySelector('.panel-visible');
      visibleElement.classList.add('panel-closing');
      visibleElement.classList.remove('panel-visible');
      this.$interval(() => {
        const closingPanels = document.querySelectorAll('.panel-closing');
        for (const index in closingPanels) {
          if (typeof (closingPanels[index]) === 'object') {
            closingPanels[index].classList.remove('panel-closing');
          }
        }

        this.rightPanelVisible = false;
        this.control.rightPanelVisible = this.rightPanelVisible;
        this.setCommentContext('');
      }, delay, 1);
    }
  }

  setCommentContext = (contextGuid: string): void => {
    this.commentContext.contextGuid = contextGuid;
  }

  getContextParts = (contextGuid: string) => {
    const parts = {
      value: '',
      option: { key: '', label: '' },
      field: '',
      fieldConfig: {},
      inputSystem: '',
      sense: { index: '', guid: '' },
      example: { index: '', guid: '' }
    };
    if (contextGuid == null || this.lecConfig == null) {
      return parts;
    }

    const contextParts = contextGuid.split(/(sense#.+?\s)|(example#.+?\s)/);
    let exampleGuid = '';
    let senseGuid = '';
    let field = '';
    let fieldConfig: LexConfig = new LexConfig();
    let inputSystem = '';
    let optionKey = '';
    let optionLabel = '';
    let senseIndex = null;
    let exampleIndex = null;
    const currentEntry = this.currentEntry;
    let currentValue = '';
    let currentField = null;
    let contextPart = '';

    for (const i in contextParts) {
      if (contextParts.hasOwnProperty(i) && contextParts[i] != null && contextParts[i] !== '') {
        contextPart = contextParts[i].trim();
        if (contextPart.includes('sense#')) {
          senseGuid = contextPart.substr(6);
        } else if (contextPart.includes('example#')) {
          exampleGuid = contextPart.substr(8);
        } else if (contextPart.includes('#')) {
          field = contextPart.substr(0, contextPart.indexOf('#'));
          optionKey = contextPart.substr(contextPart.indexOf('#') + 1);
          if (optionKey.includes('.')) {
            inputSystem = optionKey.substr(optionKey.indexOf('.') + 1);
          }
        } else if (contextPart.includes('.')) {
          field = contextPart.substr(0, contextPart.indexOf('.'));
          inputSystem = contextPart.substr(contextPart.indexOf('.') + 1);
        } else {
          field = contextPart;
        }
      }
    }

    if (senseGuid) {
      for (const a in currentEntry.senses) {
        if (currentEntry.senses.hasOwnProperty(a) && currentEntry.senses[a].guid === senseGuid) {
          senseIndex = a;
          if (exampleGuid) {
            for (const b in currentEntry.senses[a].examples) {
              if (currentEntry.senses[a].examples.hasOwnProperty(b) &&
                currentEntry.senses[a].examples[b].guid === exampleGuid
              ) {
                exampleIndex = b;
              }
            }
          }
        }
      }
    }

    const senses = this.lecConfig.entry.fields.senses as LexConfigFieldList;
    const examples = senses.fields.examples as LexConfigFieldList;
    if (exampleGuid && exampleIndex) {
      if (currentEntry.senses[senseIndex].examples[exampleIndex].hasOwnProperty(field)) {
        currentField = currentEntry.senses[senseIndex].examples[exampleIndex][field];
        if (examples.fields.hasOwnProperty(field)) {
          fieldConfig = examples.fields[field];
        }
      }
    } else if (senseGuid && senseIndex) {
      if (currentEntry.senses[senseIndex].hasOwnProperty(field)) {
        currentField = currentEntry.senses[senseIndex][field];
        if (senses.fields.hasOwnProperty(field)) {
          fieldConfig = senses.fields[field];
        }
      }
    } else if (currentEntry.hasOwnProperty(field)) {
      currentField = currentEntry[field];
      if (this.lecConfig.entry.fields.hasOwnProperty(field)) {
        fieldConfig = this.lecConfig.entry.fields[field];
      }
    }

    if (currentField !== null) {
      if (currentField.hasOwnProperty(inputSystem)) {
        currentValue = currentField[inputSystem].value;
      } else if (currentField.hasOwnProperty('value')) {
        currentValue = currentField.value;
      } else {
        currentValue = optionKey;
      }

      // Option lists only get their key saved on the comment so we need to find the value
      if (fieldConfig !== null &&
        (fieldConfig.type === 'multioptionlist' || fieldConfig.type === 'optionlist')
      ) {
        if (field === 'semanticDomain') {
          // Semantic domains are in the global scope and appear to be English only
          // Will need to be updated once the system provides support for other languages
          for (const key in this.semanticDomains.data) {
            if (this.semanticDomains.data.hasOwnProperty(key) && key === optionKey) {
              optionLabel = this.semanticDomains.data[key].value;
              break;
            }
          }
        } else {
          const optionLists = this.lecConfig.optionlists;
          outerFor:
          for (const listCode in optionLists) {
            if (optionLists.hasOwnProperty(listCode) && listCode === (fieldConfig as LexConfigOptionList).listCode) {
              for (const i in optionLists[listCode].items) {
                if (optionLists[listCode].items.hasOwnProperty(i)) {
                  const item = optionLists[listCode].items[i];
                  if (
                    (item.key === optionKey && fieldConfig.type === 'multioptionlist') ||
                    (item.key === currentValue && fieldConfig.type === 'optionlist')
                  ) {
                    optionKey = item.key;
                    optionLabel = item.value;
                    break outerFor;
                  }
                }
              }
            }
          }
        }
      }
    }

    parts.value = currentValue;
    parts.option.key = optionKey;
    parts.option.label = optionLabel;
    parts.field = field;
    parts.fieldConfig = fieldConfig;
    parts.inputSystem = inputSystem;
    parts.sense.index = senseIndex;
    parts.sense.guid = senseGuid;
    parts.example.index = exampleIndex;
    parts.example.guid = exampleGuid;
    return parts;
  }

  private goToEntry(entryId: string): void {
    if (this.$state.is('editor.entry')) {
      this.$state.go('.', {
        entryId,
        sortBy: this.entryListModifiers.sortBy.label,
        filterText: this.entryListModifiers.filterText(),
        sortReverse: this.entryListModifiers.sortReverse,
        filterType: this.entryListModifiers.filterType,
        filterBy: this.entryListModifiers.filterByLabel()
      }, { notify: false });
    } else {
      this.$state.go('editor.entry', {
        entryId,
        sortBy: this.$state.params.sortBy,
        filterText: this.$state.params.filterText,
        sortReverse: this.$state.params.sortReverse,
        filterType: this.$state.params.filterType,
        filterBy: this.$state.params.filterBy
      });
    }
  }

  private evaluateState(): void {
    this.editorService.loadEditorData().then(() => {
      // if entry not found go to first visible entry
      let entryId = this.$state.params.entryId;
      if (this.editorService.getIndexInList(entryId, this.entries) == null) {
        entryId = '';
        if (this.visibleEntries[0] != null) {
          entryId = this.visibleEntries[0].id;
        }
      }

      if (this.$state.is('editor.entry')) {
        this.editEntryAndScroll(entryId);
      }
    });
  }

  private setSelectedFilter(collections: any[], params: string) {
    if (collections && params) {
      return this.$filter('filter')(collections, (item: any) => {
        if (item.label === params) {
          return item;
        }
      });
    }
  }

  private setSortAndFilterOptionsFromConfig(): void {
    if (this.lecConfig == null) {
      return;
    }

    const sortOptions: SortOption[] = [{
      label: 'Default',
      value: 'default'
    }];
    const filterOptions: FilterOption[] = [];
    for (const entryFieldName of this.lecConfig.entry.fieldOrder) {
      const entryField = this.lecConfig.entry.fields[entryFieldName];
      if (entryField.hideIfEmpty) {
        break;
      }

      if (entryFieldName === 'senses') {
        const configSenses = this.lecConfig.entry.fields.senses as LexConfigFieldList;
        for (const senseFieldName of configSenses.fieldOrder) {
          const senseField = configSenses.fields[senseFieldName];
          if (senseField.hideIfEmpty || senseField.type === 'fields') {
            break;
          }

          sortOptions.push({ label: senseField.label, value: senseFieldName });
          if (senseField.type === 'multitext') {
            for (const inputSystemTag of (senseField as LexConfigMultiText).inputSystems) {
              const abbreviation = this.getInputSystemAbbreviation(inputSystemTag);
              filterOptions.push({
                label: senseField.label + ' [' + abbreviation + ']',
                level: 'sense', value: senseFieldName, type: 'multitext',
                inputSystem: inputSystemTag, key: senseFieldName + '-' + inputSystemTag
              });
            }
          } else {
            filterOptions.push({
              label: senseField.label, level: 'sense', value: senseFieldName,
              type: senseField.type, key: senseFieldName
            });
          }
        }
      } else {
        sortOptions.push({ label: entryField.label, value: entryFieldName });
        if (entryField.type === 'multitext') {
          for (const inputSystemTag of (entryField as LexConfigMultiText).inputSystems) {
            const abbreviation = this.getInputSystemAbbreviation(inputSystemTag);
            filterOptions.push({
              label: entryField.label + ' [' + abbreviation + ']',
              level: 'entry', value: entryFieldName, type: 'multitext',
              inputSystem: inputSystemTag, key: entryFieldName + '-' + inputSystemTag
            });
          }
        } else {
          filterOptions.push({
            label: entryField.label, level: 'entry', value: entryFieldName,
            type: entryField.type, key: entryFieldName
          });
        }
      }
    }
    filterOptions.push({ label: 'Comments', value: 'comments', type: 'comments', key: 'comments' });
    filterOptions.push({
      label: 'Example Sentences', value: 'exampleSentences', type: 'exampleSentences', key: 'exampleSentences'
    });
    filterOptions.push({ label: 'Pictures', value: 'pictures', type: 'pictures', key: 'pictures' });
    let hasAudioInputSystem = false;
    for (const inputSystemsTag in this.lecConfig.inputSystems) {
      if (this.lecConfig.inputSystems.hasOwnProperty(inputSystemsTag) && LexiconUtilityService.isAudio(inputSystemsTag)
      ) {
        hasAudioInputSystem = true;
        break;
      }
    }

    if (hasAudioInputSystem) {
      filterOptions.push({ label: 'Audio', value: 'audio', type: 'audio', key: 'audio' });
    }

    LexiconUtilityService.arrayCopyRetainingReferences(sortOptions, this.entryListModifiers.sortOptions);
    LexiconUtilityService.arrayCopyRetainingReferences(filterOptions, this.entryListModifiers.filterOptions);
  }

  private resetEntryLists(id: string, pristineEntry: LexEntry): void {
    const entryIndex = this.editorService.getIndexInList(id, this.entries);
    const entry = this.prepCustomFieldsForUpdate(pristineEntry);
    if (entryIndex != null) {
      this.entries[entryIndex] = entry;
      this.currentEntry = pristineEntry;
      this.control.currentEntry = this.currentEntry;
    }

    const visibleEntryIndex = this.editorService.getIndexInList(id, this.visibleEntries);
    if (visibleEntryIndex != null) {
      this.visibleEntries[visibleEntryIndex] = entry;
    }
  }

  private getInputSystemAbbreviation(inputSystemTag: string): string {
    if (this.lecConfig == null || this.lecConfig.inputSystems == null ||
      !(inputSystemTag in this.lecConfig.inputSystems)
    ) {
      return inputSystemTag;
    }

    return this.lecConfig.inputSystems[inputSystemTag].abbreviation;
  }

  private setCurrentEntry(entry: LexEntry = new LexEntry()): void {
    // align custom fields into model
    entry = this.alignCustomFieldsInData(entry);

    // auto-make a valid model but stop at the examples array
    entry = this.makeValidModelRecursive(this.lecConfig.entry, entry, 'examples');

    this.currentEntry = entry;
    this.control.currentEntry = this.currentEntry;
    this.pristineEntry = angular.copy(entry);
    this.saveStatus = 'unsaved';
  }

  private prepEntryForUpdate(entry: LexEntry): LexEntry {
    const entryForUpdate: LexEntry = this.recursiveRemoveProperties(angular.copy(entry),
      ['mercurialSha', 'authorInfo', 'dateCreated', 'dateModified', '$$hashKey']);
    return this.prepCustomFieldsForUpdate(entryForUpdate);
  }

  private alignCustomFieldsInData(data: any): any {
    if (data.customFields != null) {
      for (const key in data.customFields) {
        if (data.customFields.hasOwnProperty(key)) {
          data[key] = data.customFields[key];
        }
      }
    }

    if (data.senses != null) {
      for (const sense of data.senses) {
        this.alignCustomFieldsInData(sense);
      }
    }

    if (data.examples != null) {
      for (const example of data.examples) {
        this.alignCustomFieldsInData(example);
      }
    }

    return data;
  }

  private prepCustomFieldsForUpdate(data: any): any {
    data.customFields = {};
    for (const fieldName in data) {
      if (data.hasOwnProperty(fieldName)) {
        if (/^customField_/.test(fieldName)) {
          data.customFields[fieldName] = data[fieldName];
        }

        if (fieldName === 'senses' || fieldName === 'examples') {
          data[fieldName] = this.prepCustomFieldsForUpdate(data[fieldName]);
        }
      }
    }

    return data;
  }

  private recursiveRemoveProperties(startAt: any, properties: string[]): any {
    for (const fieldName in startAt) {
      if (startAt.hasOwnProperty(fieldName)) {
        let isPropertyDeleted = false;
        for (const property of properties) {
          if (fieldName === property) {
            delete startAt[fieldName];
            isPropertyDeleted = true;
            break;
          }
        }

        if (!isPropertyDeleted && angular.isObject(startAt[fieldName])) {
          this.recursiveRemoveProperties(startAt[fieldName], properties);
        }
      }
    }

    return startAt;
  }

  private startAutoSaveTimer(): void {
    if (this.autoSaveTimer != null) {
      return;
    }

    this.autoSaveTimer = this.$interval(() => {
      this.saveCurrentEntry(true);
    }, 5000, 1);
  }

  private cancelAutoSaveTimer(): void {
    if (this.autoSaveTimer != null) {
      this.$interval.cancel(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }

  private warnOfUnsavedEdits(entry: LexEntry): void {
    this.warnOfUnsavedEditsId = this.notice.push(this.notice.WARN, 'A synchronize has been started by ' +
      'another user. When the synchronize has finished, please check your recent edits in entry "' +
      this.getWordForDisplay(entry) + '".');
  }

  private pollUpdateSuccess = (): void => {
    if (this.hasUnsavedChanges()) {
      if (this.sendReceive.isInProgress()) {
        this.cancelAutoSaveTimer();
        this.warnOfUnsavedEdits(this.currentEntry);
        this.resetEntryLists(this.currentEntry.id, angular.copy(this.pristineEntry));
      }
    } else {
      this.setCurrentEntry(this.entries[this.editorService.getIndexInList(this.currentEntry.id, this.entries)]);
    }
  }

  private syncProjectStatusSuccess = (): void => {
    this.editorService.refreshEditorData().then(() => {
      this.setCurrentEntry(this.entries[this.editorService.getIndexInList(this.currentEntry.id, this.entries)]);
      this.notice.removeById(this.warnOfUnsavedEditsId);
      this.warnOfUnsavedEditsId = undefined;
    });
  }

  private scrollListToEntry(id: string, position: string): void {
    const posOffset = (position === 'top') ? 274 : 487;
    const entryDivId = '#entryId_' + id;
    const listDivId = '#compactEntryListContainer';
    let index;

    // make sure the item is visible in the list
    // todo implement lazy "up" scrolling to make this more efficient

    // only expand the "show window" if we know that the entry is actually in
    // the entry list - a safe guard
    if (this.editorService.getIndexInList(id, this.filteredEntries) != null) {
      while (this.visibleEntries.length < this.filteredEntries.length) {
        index = this.editorService.getIndexInList(id, this.visibleEntries);
        if (index != null) {
          break;
        }

        this.editorService.showMoreEntries();
      }
    } else {
      console.warn('Error: tried to scroll to an entry that is not in the entry list!');
    }

    // note: ':visible' is a JQuery invention that means 'it takes up space on
    // the page'.
    // It may actually not be visible at the moment because it may down inside a
    // scrolling div or scrolled off the view of the page
    if ($(listDivId).is(':visible') && $(entryDivId).is(':visible')) {
      LexiconEditorController.scrollDivToId(listDivId, entryDivId, posOffset);
    } else {
      // wait then try to scroll
      this.$interval(() => {
        LexiconEditorController.scrollDivToId(listDivId, entryDivId, posOffset);
      }, 200, 1);
    }
  }

  private static scrollDivToId(containerId: string, divId: string, posOffset: number = 0): void {
    const $containerDiv: any = $(containerId);
    let $div: any = $(divId);
    let foundDiv: boolean = false;
    let offsetTop: number = 0;

    // todo: refactor this spaghetti logic
    if ($div && $containerDiv) {
      if ($div.offsetTop == null) {
        if ($div[0] != null) {
          $div = $div[0];
          foundDiv = true;
        } else {
          console.log('Error: unable to scroll to div with div id ' + divId);
        }
      }

      if (foundDiv) {
        if ($div.offsetTop == null) {
          offsetTop = $div.offset().top - posOffset;
        } else {
          offsetTop = $div.offsetTop - posOffset;
        }

        if (offsetTop < 0) {
          offsetTop = 0;
        }
        $containerDiv.scrollTop(offsetTop);
      }
    }
  }

  private static entryIsNew(entry: LexEntry): boolean {
    return (entry.id && entry.id.includes('_new_'));
  }

  private static normalizeStrings(data: any): any {
    return JSON.parse(JSON.stringify(data).normalize());
  }

}

export class LexiconEditorListController implements angular.IController {
  static $inject = ['lexProjectService'];
  constructor(private readonly lexProjectService: LexiconProjectService) { }

  $onInit(): void {
    this.lexProjectService.setBreadcrumbs('editor/list', 'List');
    this.lexProjectService.setupSettings();
  }

}

export class LexiconEditorEntryController implements angular.IController {
  static $inject = ['lexProjectService'];
  constructor(private readonly lexProjectService: LexiconProjectService) { }

  $onInit(): void {
    this.lexProjectService.setBreadcrumbs('editor/entry', 'Edit');
    this.lexProjectService.setupSettings();
  }

}

export const LexiconEditorComponent: angular.IComponentOptions = {
  bindings: {
    lecConfig: '<',
    lecInterfaceConfig: '<',
    lecFinishedLoading: '<',
    lecProject: '<',
    lecOptionLists: '<',
    lecRights: '<'
  },
  controller: LexiconEditorController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/editor.component.html'
};
