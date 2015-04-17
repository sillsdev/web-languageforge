'use strict';

angular.module('lexicon.services')

// Lexicon Entry Service
.factory('lexEditorDataService', ['$q', 'editorDataService', 'lexEntryApiService', 'sessionService', 'lexiconOfflineCache', 'commentsOfflineCache', 'silNoticeService', 'lexCommentService',
function($q, editorDataService, api, ss, commentsCache, notice, commentService) {

  editorDataService.registerEntryApi(api);

  return {
    loadEditorData: editorDataService.loadEditorData,
    refreshEditorData: editorDataService.refreshEditorData,
    removeEntryFromLists: editorDataService.removeEntryFromLists,
    addEntryToEntryList: editorDataService.addEntryToEntryList,
    entries: editorDataService.entries,
    visibleEntries: editorDataService.visibleEntries,
    showInitialEntries: editorDataService.showInitialEntries,
    showMoreEntries: editorDataService.showMoreEntries
  };

}]);
