'use strict';

angular.module('semdomtrans.services', ['bellows.services'])
  .service('semdomtransSetupService', ['apiService',
  function (api) {

    this.createProject = api.method('semdom_create_project');
    this.getOpenProjects = api.method('semdom_get_open_projects');
    this.doesProjectExist = api.method('semdom_project_exists');
    this.doesGoogleTranslateDataExist = api.method('semdom_does_googletranslatedata_exist');

  }])
  .service('semdomtransEditService', ['apiService',
  function (api) {

    this.dbeDtoFull = api.method('semdom_editor_dto');
    this.dbeDtoUpdatesOnly = api.method('semdom_editor_dto');
    this.updateTerm = api.method('semdom_item_update');
    this.updateWorkingSet = api.method('semdom_workingset_update');
    this.exportProject = api.method('semdom_export_project');

  }])
  .factory('semdomtransEditorDataService', ['$q', 'editorDataService', 'semdomtransEditService', 'semdomtransOfflineCache',
  function ($q, editorDataService, api, semdomCache) {

    editorDataService.registerEntryApi(api);
    var workingSets = [];
    var itemsTree = {};
    var entries = editorDataService.entries;

    function constructSemdomTree(items) {
      for (var i in items) {
        var item = items[i];
        itemsTree[item.key] = { content: item, children: [], parent: '' };
        if (item.key.length >= 3) {
          itemsTree[item.key.substring(0, item.key.length - 2)].children.push(item.key);
          itemsTree[item.key].parent = item.key.substring(0, item.key.length - 2);
        }
      }
    }

    function createShowAllWorkingSet(items) {
      var allItemsWS = { id: '',  name: 'Show All', isShared: false, itemKeys: [] };

      for (var i in items) {
        allItemsWS.itemKeys.push(items[i].key);
      }

      return allItemsWS;
    }

    /**
     * Persists the Lexical data in the offline cache store
     */
    function storeDataInOfflineCache(data) {
      return semdomCache.updateWorkingSets(data);
    }

    /**
     * Persists the Lexical data in the offline cache store
     */
    function loadDataFromOfflineCache() {
      return semdomCache.getAllWorkingSets();
    }

    function processEditorDto(dtoResult) {
      var deferred = $q.defer();
      if (semdomCache.canCache() && workingSets.length == 0) {
        loadDataFromOfflineCache().then(function (cacheResult) {
          processWholeDto(cacheResult, dtoResult);
          deferred.resolve();
        }, function () {

          processWholeDto(dtoResult);
          deferred.resolve();
        });
      } else {
        spliceInDto(dtoResult);
        deferred.resolve();
      }

      return deferred.promise;
    }

    function spliceInDto(dtoResult) {
      // splicing in working sets
      for (var i in dtoResult.data.workingSets) {
        var ws = dtoResult.data.workingSets[i];
        var pos = findPos(workingSets, ws.id);
        if (pos > -1) {
          workingSets[pos] = ws;
        } else {
          workingSets.push(ws);
        }
      }

      constructSemdomTree(entries);
      storeDataInOfflineCache(workingSets);
    }

    function processWholeDto(cacheResult, dtoResult) {
      if (cacheResult.length == 0) {
        var allItemsWS = createShowAllWorkingSet(entries);
        workingSets.push.apply(workingSets, [allItemsWS]);
      }

      workingSets.push.apply(workingSets, cacheResult);
      spliceInDto(dtoResult);
      constructSemdomTree(entries);
      storeDataInOfflineCache(workingSets);
    }

    function findPos(arr, id) {
      for (var i in arr) {
        if (arr[i].id == id) {
          return i;
        }
      }

      return -1;
    }

    return {
      itemsTree: itemsTree,
      workingSets: workingSets,
      processEditorDto: processEditorDto,
      loadEditorData: editorDataService.loadEditorData,
      refreshEditorData: editorDataService.refreshEditorData,
      removeEntryFromLists: editorDataService.removeEntryFromLists,
      addEntryToEntryList: editorDataService.addEntryToEntryList,
      entries: editorDataService.entries,
      visibleEntries: editorDataService.visibleEntries,
      showInitialEntries: editorDataService.showInitialEntries,
      showMoreEntries: editorDataService.showMoreEntries
    };

  }])
  .factory('semdomtransOfflineCache', ['$window', '$q', 'asyncSession', 'offlineCache',
  function ($window, $q, sessionService, offlineCache) {

    function getAllWorkingSets() {
      return offlineCache.getAllFromStore('workingsets', sessionService.projectId());
    }

    function deleteWorkingSet(id) {
      return offlineCache.deleteObjectInStore('workingsets', id);
    }

    function updateWorkingSets(workingSets) {
      return offlineCache.setObjectsInStore('workingsets', sessionService.projectId(), workingSets);
    }

    return {
      canCache: offlineCache.canCache,
      getAllWorkingSets: getAllWorkingSets,
      deleteWorkingSet: deleteWorkingSet,
      updateWorkingSets: updateWorkingSets
    };
  }]);
