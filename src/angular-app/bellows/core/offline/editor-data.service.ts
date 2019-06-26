import * as angular from 'angular';

import {SemanticDomainsService} from '../../../languageforge/core/semantic-domains/semantic-domains.service';
import {LexConfigMultiText} from '../../../languageforge/lexicon/shared/model/lexicon-config.model';
import {LexiconProjectSettings} from '../../../languageforge/lexicon/shared/model/lexicon-project-settings.model';
import {JsonRpcResult} from '../api/api.service';
import {NoticeService} from '../notice/notice.service';
import {SessionService} from '../session.service';
import {UtilityService} from '../utility.service';
import {CommentsOfflineCacheService} from './comments-offline-cache.service';
import {EditorOfflineCacheService} from './editor-offline-cache.service';
import {LexiconCommentService} from './lexicon-comments.service';

class FilterBy {
  label?: string;
  level?: string;
  type?: string;
  value?: string;
  inputSystem?: string;
}

class EntryListModifiers {
  sortBy: {
    label: string,
    value: string
  };
  sortOptions: any;
  sortReverse: boolean;
  filterBy: FilterBy;
  filterOptions: any;
  filterType: string;
}

export class EditorDataService {
  readonly browserInstanceId: string = Math.floor(Math.random() * 1000000).toString();

  entries: any[] = [];
  visibleEntries: any[] = [];
  filteredEntries: any[] = [];
  entryListModifiers: EntryListModifiers = {
    sortBy: {
      label: 'Word',
      value: 'lexeme'
    },
    sortOptions: {},
    sortReverse: false,
    filterBy: null,
    filterOptions: {},
    filterType: 'isNotEmpty'
  };

  private api: any;

  static $inject: string[] = ['$q', 'silNoticeService',
    'sessionService', 'editorOfflineCache',
    'commentsOfflineCache',
    'semanticDomainsService',
    'lexCommentService'
  ];
  constructor(private readonly $q: angular.IQService, private readonly notice: NoticeService,
              private readonly sessionService: SessionService, private readonly cache: EditorOfflineCacheService,
              private readonly commentsCache: CommentsOfflineCacheService,
              private readonly semanticDomains: SemanticDomainsService,
              private readonly commentService: LexiconCommentService) { }

  showInitialEntries = (): angular.IPromise<any> => {
    return this.sortAndFilterEntries(true);
  }

  showMoreEntries = (): void => {
    const increment = 50;
    if (this.visibleEntries.length < this.filteredEntries.length) {
      UtilityService.arrayCopyRetainingReferences(
        this.filteredEntries.slice(0, this.visibleEntries.length + increment), this.visibleEntries);
    }
  }

  registerEntryApi(a: any): void {
    this.api = a;
  }

  /**
   * Called when loading the controller
   */
  loadEditorData = (): angular.IPromise<any> => {
    const deferred = this.$q.defer();
    if (this.entries.length === 0) { // first page load
      if (this.cache.canCache()) {
        this.notice.setLoading('Loading Dictionary');
        this.loadDataFromOfflineCache().then((projectObj: any) => {
          if (projectObj.isComplete) {
            this.showInitialEntries().then(() => {
              this.notice.cancelLoading();
              this.refreshEditorData(projectObj.timestamp).then((result: any) => {
                deferred.resolve(result);
              });
            });
          } else {
            this.entries = [];
            console.log('Editor: cached data was found to be incomplete. Full download started...');
            this.notice.setLoading('Downloading Full Dictionary.');
            this.notice.setPercentComplete(0);
            this.doFullRefresh().then(result => {
              deferred.resolve(result);
              this.notice.setPercentComplete(100);
              this.notice.cancelLoading();
            });
          }

        }, () => {
          // no data found in cache
          console.log('Editor: no data found in cache. Full download started...');
          this.notice.setLoading('Downloading Full Dictionary.');
          this.notice.setPercentComplete(0);
          this.doFullRefresh().then(result => {
            deferred.resolve(result);
            this.notice.setPercentComplete(100);
            this.notice.cancelLoading();
          });
        });
      } else {
        console.log('Editor: caching not enabled. Full download started...');
        this.notice.setLoading('Downloading Full Dictionary.');
        this.notice.setPercentComplete(0);
        this.doFullRefresh().then(result => {
          deferred.resolve(result);
          this.notice.setPercentComplete(100);
          this.notice.cancelLoading();
        });
      }
    } else {
      // intentionally not showing any loading message here
      this.refreshEditorData().then((result: any) => {
        deferred.resolve(result);
      });
    }

    return deferred.promise;
  }

  /**
   * Call this after every action that requires a pull from the server
   */
  refreshEditorData = (timestamp?: number): angular.IPromise<any> => {
    const deferred = this.$q.defer();

    // get data from the server
    if (Offline.state === 'up') {
      this.api.dbeDtoUpdatesOnly(this.browserInstanceId, timestamp, (update: any) => {
        this.processEditorDto(update, true).then((result: any) => {
          if (result.data.itemCount > 0) {
            console.log('Editor: processed ' + result.data.itemCount + ' entries from server.');
          }

          deferred.resolve(result);
        });
      });
    } else {
      return this.$q.when();
    }

    return deferred.promise;
  }

  addEntryToEntryList = (entry: any): void => {
    this.entries.unshift(entry);
  }

  removeEntryFromLists = (id: string): angular.IPromise<any> => {
    angular.forEach([this.entries, this.filteredEntries, this.visibleEntries], list => {
      const i = this.getIndexInList(id, list);
      if (angular.isDefined(i)) {
        list.splice(i, 1);
      }
    });

    return this.cache.deleteEntry(id);
  }

  processEditorDto(result: JsonRpcResult, updateOnly: boolean): angular.IPromise<any> {
    const deferred = this.$q.defer();
    let isLastRequest = true;
    if (result.ok) {
      this.commentService.comments.counts.userPlusOne = result.data.commentsUserPlusOne;
      if (!updateOnly) {
        UtilityService.arrayExtend(this.entries, result.data.entries);
        this.commentService.comments.items.all.push.apply(this.commentService.comments.items.all, result.data.comments);
      } else {
        // splice updates into entry list don't need to modify filteredEntries or visibleEntries since those are
        // regenerated from sortAndFilterEntries() below
        angular.forEach(result.data.entries, entry => {
          // splice into entries list
          const i = this.getIndexInList(entry.id, this.entries);
          if (angular.isDefined(i)) {
            this.entries[i] = entry;
          } else {
            this.addEntryToEntryList(entry);
          }
        });

        // splice comment updates into comments list
        angular.forEach(result.data.comments, comment => {
          const i = this.getIndexInList(comment.id, this.commentService.comments.items.all);
          if (angular.isDefined(i)) {
            this.commentService.comments.items.all[i] = comment;
          } else {
            this.commentService.comments.items.all.push(comment);
          }
        });

        // remove deleted entries according to deleted ids
        angular.forEach(result.data.deletedEntryIds, this.removeEntryFromLists);

        angular.forEach(result.data.deletedCommentIds, this.commentService.removeCommentFromLists);

        // only sort and filter the list if there have been changes to entries (or deleted entries)
        if (result.data.entries.length > 0 || result.data.deletedEntryIds.length > 0) {
          this.sortAndFilterEntries(true);
        }
      }

      if (result.data.itemCount &&
          result.data.itemCount + result.data.offset < result.data.itemTotalCount) {
        isLastRequest = false;
      }

      this.storeDataInOfflineCache(result.data, isLastRequest);

      this.commentService.updateGlobalCommentCounts();
      deferred.resolve(result);
    } else {  // if (result.ok)
      deferred.reject(result);
    }
    return deferred.promise;
  }

  // noinspection JSMethodCanBeStatic
  getIndexInList = (id: string, list: any): number => {
    let index: number;
    for (let i = 0; i < list.length; i++) {
      const entry = list[i];
      if (entry.id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  sortEntries = (shouldResetVisibleEntriesList: boolean): angular.IPromise<any> => {
    const startTime = performance.now();
    return this.sessionService.getSession().then(session => {
      const config = session.projectSettings<LexiconProjectSettings>().config;

      // the length = 0 followed by Array.push.apply is a method of replacing the contents of an array without creating
      // a new array thereby keeping original references to the array
      const entriesSorted = this.sortList(config, this.entries);
      UtilityService.arrayCopyRetainingReferences(entriesSorted, this.entries);
      const filteredEntriesSorted = this.sortList(config, this.filteredEntries);
      UtilityService.arrayCopyRetainingReferences(filteredEntriesSorted, this.filteredEntries);
      this.sortList(config, this.visibleEntries);
      if (shouldResetVisibleEntriesList) {
        // TODO: Magic number "50" below should become a constant somewhere
        UtilityService.arrayCopyRetainingReferences(filteredEntriesSorted.slice(0, 50), this.visibleEntries);
      }
      const sortTime = (performance.now() - startTime) / 1000;
      if (sortTime > 0.5) {
        console.warn('Sort time took ' + sortTime.toFixed(2) + ' seconds.');
      }
    });
  }

  filterEntries = (shouldResetVisibleEntriesList: boolean): angular.IPromise<any> => {
    return this.sessionService.getSession().then(session => {
      const config = session.projectSettings<LexiconProjectSettings>().config;
      if (this.entryListModifiers.filterBy) {
        UtilityService.arrayCopyRetainingReferences(this.entries.filter((entry: any) => {
          return this.entryMeetsFilterCriteria(config, entry);
        }), this.filteredEntries);
      } else {
        UtilityService.arrayCopyRetainingReferences(this.entries, this.filteredEntries);
      }

      if (shouldResetVisibleEntriesList) {
        // TODO: Magic number "50" below should become a constant somewhere
        UtilityService.arrayCopyRetainingReferences(this.filteredEntries.slice(0, 50), this.visibleEntries);
      }
    });
  }

  getSortableValue = (config: any, entry: any): string => {
    const fieldKey = this.entryListModifiers.sortBy.value;
    let sortableValue = '';
    let field;
    let dataNode;
    const isSpecialMultitext = (fieldKey === 'lexeme' || fieldKey === 'citationForm');
    if (fieldKey in config.entry.fields && fieldKey in entry) {
      field = config.entry.fields[fieldKey];
      dataNode = entry[fieldKey];
    } else if (fieldKey in config.entry.fields.senses.fields && angular.isDefined(entry.senses) &&
      entry.senses.length > 0 && fieldKey in entry.senses[0]
    ) {
      field = config.entry.fields.senses.fields[fieldKey];
      dataNode = entry.senses[0][fieldKey];
    }

    if (field || isSpecialMultitext) {
      if (isSpecialMultitext || field.type === 'multitext') {
        // special case for lexeme form / citation form. Use citation form if available, fall back to lexeme form
        if (fieldKey === 'lexeme' || fieldKey === 'citationForm') {
          if (config.entry.fields.citationForm) {
            const citationFormInputSystems = config.entry.fields.citationForm.inputSystems;
            if (entry.citationForm && citationFormInputSystems.length > 0 &&
              citationFormInputSystems[0] in entry.citationForm
            ) {
              sortableValue = entry.citationForm[citationFormInputSystems[0]].value;
            }
          }

          if (!sortableValue) {
            const lexemeInputSystems = config.entry.fields.lexeme.inputSystems;
            if (entry.lexeme && lexemeInputSystems.length > 0 && lexemeInputSystems[0] in entry.lexeme) {
              sortableValue = entry.lexeme[lexemeInputSystems[0]].value;
            }
          }

        // regular multi-text field
        } else {
          if (field.inputSystems.length > 0 && field.inputSystems[0] in dataNode) {
            sortableValue = dataNode[field.inputSystems[0]].value;
          }
        }
      } else if (field.type === 'optionlist') {
        if (config.optionlists && config.optionlists[field.listCode]) {
          // something weird here with config.optionlists not being set consistently when this is called - cjh 2017-07
          sortableValue = this.getOptionListItem(config.optionlists[field.listCode], dataNode.value).value;
        } else {
          sortableValue = dataNode.value;
        }
      } else if (field.type === 'multioptionlist' && dataNode.values.length > 0) {
        if (field.listCode === 'semantic-domain-ddp4') {
          if (this.semanticDomains.data[dataNode.values[0]]) {
            sortableValue = this.semanticDomains.data[dataNode.values[0]].value;
          } else {
            sortableValue = dataNode.values[0];
          }
        } else {
          if (config.optionlists && config.optionlists[field.listCode]) {
            sortableValue = this.getOptionListItem(config.optionlists[field.listCode], dataNode.values[0]).value;
          } else {
            sortableValue = dataNode.values[0].value;
          }
        }
      }
    }

    if (!sortableValue) {
      return '[Empty]';
    }

    return sortableValue;
  }

  private doFullRefresh(offset: number = 0): angular.IPromise<any> {
    const deferred = this.$q.defer();
    this.api.dbeDtoFull(this.browserInstanceId, offset, (result: JsonRpcResult) => {
      if (!result.ok) {
        this.notice.cancelLoading();
        deferred.reject(result);
        return;
      }

      const newOffset = offset + result.data.itemCount;
      const totalCount = result.data.itemTotalCount;
      this.notice.setPercentComplete(Math.round(newOffset * 100 / totalCount));
      this.processEditorDto(result, false).then(() => {
        if (offset === 0) {
          this.showInitialEntries();
        }

        if (newOffset < totalCount) {
          this.doFullRefresh(newOffset).then(newResult => {
            // TODO: Merge the old and new results so that we're returning the full array
            deferred.resolve(newResult);
          });
        } else {
          this.sortAndFilterEntries(true).then(() => {
            deferred.resolve(result);
          });
        }
      });
    });

    return deferred.promise;
  }

  private entryMeetsFilterCriteria(config: any, entry: any): boolean {
    const mustNotBeEmpty = this.entryListModifiers.filterType === 'isNotEmpty';
    let containsData = false;
    const filterType = this.entryListModifiers.filterBy.type;
    if (['comments', 'exampleSentences', 'pictures', 'audio'].indexOf(filterType) !== -1) {
      // special filter types
      switch (filterType) {
        case 'comments':
          containsData = this.commentService.getEntryCommentCount(entry.id) > 0;
          break;
        case 'exampleSentences':
          angular.forEach(entry.senses, sense => {
            if (sense.examples && sense.examples.length > 0) {
              containsData = true;
            }
          });
          break;
        case 'pictures':
          angular.forEach(entry.senses, sense => {
            if (sense.pictures && sense.pictures.length > 0) {
              containsData = true;
            }
          });
          break;
        case 'audio':
          const fieldKey = this.entryListModifiers.sortBy.value;
          let field;

          if (fieldKey in config.entry.fields) {
            field = config.entry.fields[fieldKey];
          } else if (fieldKey in config.entry.fields.senses.fields) {
            field = config.entry.fields.senses.fields[fieldKey];
          }

          angular.forEach(config.entry.fields, (entryField, entryFieldKey) => {
            if (entryField.type === 'multitext') {
              angular.forEach(entry[entryFieldKey], (fieldNode, ws) => {
                  if (ws && UtilityService.isAudio(ws) && fieldNode.value !== '') {
                    containsData = true;
                  }
                });
            }

            if (entryFieldKey === 'senses') {
              angular.forEach(entry.senses, sense => {
                angular.forEach(config.entry.fields.senses.fields, (senseField: any, senseFieldKey: string) => {
                  if (senseField.type === 'multitext') {
                    angular.forEach(sense[senseFieldKey], (fieldNode: any, ws: string) => {
                      if (ws && UtilityService.isAudio(ws) && fieldNode.value !== '') {
                        containsData = true;
                      }
                    });
                  }

                  if (senseFieldKey === 'examples') {
                    angular.forEach(sense.examples, example => {
                      angular.forEach(config.entry.fields.senses.fields.examples.fields,
                        (exampleField: any, exampleFieldKey: string) => {
                          if (exampleField.type === 'multitext') {
                            angular.forEach(example[exampleFieldKey], (fieldNode: any, ws: string) => {
                              if (ws && UtilityService.isAudio(ws) && fieldNode.value !== '') {
                                containsData = true;
                              }
                            });
                          }
                        }
                      );
                    });
                  }
                });
              });
            }
          });
          break;
      }
    } else {
      // filter by entry or sense field
      let dataNode;
      if (this.entryListModifiers.filterBy.level === 'entry') {
        dataNode = entry[this.entryListModifiers.filterBy.value];
      } else { // sense level
        if (entry.senses && entry.senses.length > 0) {
          dataNode = entry.senses[0][this.entryListModifiers.filterBy.value];
        }
      }

      if (dataNode) {
        switch (filterType) {
          case 'multitext':
            if (dataNode[this.entryListModifiers.filterBy.inputSystem]) {
              containsData = dataNode[this.entryListModifiers.filterBy.inputSystem].value !== '';
            }
            break;
          case 'optionlist':
            containsData = dataNode.value !== '';
            break;
          case 'multioptionlist':
            containsData = (dataNode.values.length > 0);
            break;
        }
      }
    }

    return (mustNotBeEmpty && containsData || !mustNotBeEmpty && !containsData);
  }

  private getOptionListItem(optionlist: any, key: string): any {
    let itemToReturn = { value: '' };
    angular.forEach(optionlist.items, item => {
      if (item.key === key) {
        itemToReturn = item;
      }
    });

    return itemToReturn;
  }

  private getInputSystemForSort(config: any): string {
    let inputSystem = 'en';
    const fieldKey = this.entryListModifiers.sortBy.value;
    let field;
    if (fieldKey in config.entry.fields) {
      field = config.entry.fields[fieldKey];
    } else if (fieldKey in config.entry.fields.senses.fields) {
      field = config.entry.fields.senses.fields[fieldKey];
    }

    if (field && field.type === 'multitext') {
      inputSystem = field.inputSystems[0];
    }

    return inputSystem;
  }

  /**
   * @returns {promise} which resolves to an project object containing the epoch cache timestamp
   */
  private loadDataFromOfflineCache(): angular.IPromise<any> {
    const startTime = performance.now();
    const deferred = this.$q.defer();
    let endTime;
    let numOfEntries: number;
    this.cache.getAllEntries().then(entries => {
      UtilityService.arrayExtend(this.entries, entries);
      numOfEntries = entries.length;
      if (entries.length > 0) {
        this.commentsCache.getAllComments().then(comments => {
          UtilityService.arrayExtend(this.commentService.comments.items.all, comments);
          this.cache.getProjectData().then(projectData => {
            this.commentService.comments.counts.userPlusOne = projectData.commentsUserPlusOne;
            endTime = performance.now();
            console.log('Editor: Loaded ' + numOfEntries + ' entries from cache in ' +
              ((endTime - startTime) / 1000).toFixed(2) + ' seconds');
            deferred.resolve(projectData);
          }, () => deferred.reject());
        }, () => deferred.reject());
      } else {
        // we got zero entries
        deferred.reject();
      }
    }, () => deferred.reject());

    return deferred.promise;
  }

  private sortAndFilterEntries(shouldResetVisibleEntriesList: boolean): angular.IPromise<any> {
    // ToDo: so far I haven't found a good case for NOT resetting visibleEntriesList.
    // and always reset visibleEntriesList - chris 2017-07
    return this.sortEntries(shouldResetVisibleEntriesList).then(() => {
      return this.filterEntries(shouldResetVisibleEntriesList);
    });
  }

  private sortList(config: any, list: any): any {
    const inputSystem = this.getInputSystemForSort(config);
    const compare = ('Intl' in window) ? Intl.Collator(inputSystem).compare : (a: string, b: string) => a < b ? -1 : 1;

    const mapped = list.map((entry: any, i: number) => ({
      index: i,
      value: this.getSortableValue(config, entry)
    }));

    mapped.sort((a: any, b: any) => compare(a.value, b.value) * (this.entryListModifiers.sortReverse ? -1 : 1));

    return mapped.map((el: any) => list[el.index]);
  }

  /**
   * Persists the Lexical data in the offline cache store
   */
  private storeDataInOfflineCache(data: any, isComplete: boolean): angular.IPromise<any> {
    const deferred = this.$q.defer();
    if (data.timeOnServer && this.cache.canCache()) {
      this.cache.updateProjectData(data.timeOnServer, data.commentsUserPlusOne, isComplete).then(() => {
        this.cache.updateEntries(data.entries).then(() => {
          this.commentsCache.updateComments(data.comments).then(() => {
            deferred.resolve();
          });
        });
      });
    } else {
      deferred.reject();
    }

    return deferred.promise;
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * A function useful for debugging (prints out to the console the lexeme values)
   */
  private printLexemesInList(entryList: any[]): void {
    this.sessionService.getSession().then(session => {
      const config = session.projectSettings<LexiconProjectSettings>().config;
      const ws = (config.entry.fields.lexeme as LexConfigMultiText).inputSystems[1];
      const arr = [];
      for (const entry of entryList) {
        if (angular.isDefined(entry.lexeme[ws])) {
          arr.push(entry.lexeme[ws].value);
        }
      }

      console.log(arr);
    });
  }

}
