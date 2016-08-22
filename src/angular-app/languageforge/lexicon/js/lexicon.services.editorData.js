'use strict';

angular.module('lexicon.services')

// Lexicon Entry Service
.factory('lexEditorDataService', ['$q', 'editorDataService', 'lexEntryApiService',
function ($q, editorDataService, api) {

  editorDataService.registerEntryApi(api);

  return {
    loadEditorData: editorDataService.loadEditorData,
    refreshEditorData: editorDataService.refreshEditorData,
    removeEntryFromLists: editorDataService.removeEntryFromLists,
    addEntryToEntryList: editorDataService.addEntryToEntryList,
    getIndexInEntries: editorDataService.getIndexInEntries,
    getIndexInVisibleEntries: editorDataService.getIndexInVisibleEntries,
    entries: editorDataService.entries,
    visibleEntries: editorDataService.visibleEntries,
    showInitialEntries: editorDataService.showInitialEntries,
    showMoreEntries: editorDataService.showMoreEntries
  };

}]);
