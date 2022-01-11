import { EditorDataService } from '../../../bellows/core/offline/editor-data.service';
import { LexiconEntryApiService } from './lexicon-entry-api.service';

export class LexiconEditorDataService {
  static $inject: string[] = ['editorDataService', 'lexEntryApiService'];
  constructor(private editorDataService: EditorDataService, private api: LexiconEntryApiService) {
    this.editorDataService.registerEntryApi(api);
  }

  entries = this.editorDataService.entries;
  entryListModifiers = this.editorDataService.entryListModifiers;
  filteredEntries = this.editorDataService.filteredEntries;
  visibleEntries = this.editorDataService.visibleEntries;

  loadEditorData = this.editorDataService.loadEditorData;
  refreshEditorData = this.editorDataService.refreshEditorData;
  removeEntryFromLists = this.editorDataService.removeEntryFromLists;
  addEntryToEntryList = this.editorDataService.addEntryToEntryList;
  getIndexInList = this.editorDataService.getIndexInList;
  getIdInFilteredList = this.editorDataService.getIdInFilteredList;
  showInitialEntries = this.editorDataService.showInitialEntries;
  showMoreEntries = this.editorDataService.showMoreEntries;
  sortEntries = this.editorDataService.sortEntries;
  filterEntries = this.editorDataService.filterEntries;
  filterAndSortEntries = this.editorDataService.filterAndSortEntries;
  getMeaningForDisplay = this.editorDataService.getMeaningForDisplay;
  getSortableValue = this.editorDataService.getSortableValue;
}
