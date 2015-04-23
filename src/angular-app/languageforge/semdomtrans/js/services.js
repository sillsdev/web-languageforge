'use strict';

angular.module('semdomtrans.services', ['jsonRpc'])
  .service('semdomtransSetupService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    

    
    this.createProject = function createProject(languageCode, callback) {
      jsonRpc.call('semdom_create_project', [languageCode], function(result) {
        callback(result);
      })
    }
    
    this.getOpenProjects = function getOpenProjects(callback) {
      jsonRpc.call('semdom_get_open_projects', [], function(result) {
            callback(result);
          });
    }
    
    this.doesProjectExist = function doesProjectExist(languageCode, callback) {
      jsonRpc.call('semdom_project_exists', [languageCode], function(result) {
            callback(result);
      });
    }
  }])
  .service('semdomtransEditService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.dbeDtoFull = function dbeDtoFull(browserInstanceId, offset, callback) {
        jsonRpc.call('semdom_editor_dto', [browserInstanceId, null], function(result) {
          callback(result);
        });
    };
    this.dbeDtoUpdatesOnly = function dbeDtoUpdatesOnly(browserInstanceId, timestamp, callback) {
      jsonRpc.call('semdom_editor_dto', [browserInstanceId, timestamp], function(result) {
        callback(result);
      });
  };
        
    this.updateTerm = function updateTerm(term, callback) {
      jsonRpc.call('semdom_item_update', [term], function(result) {
        callback(result);
      });
    };
    
    this.updateComment = function updateComment(comment, callback) {
      jsonRpc.call('semdom_comment_update', [comment], function(result) {
        callback(result);
      });
    };
    
    this.updateWorkingSet = function updateWorkingSet(workingSet, callback) {
      jsonRpc.call('semdom_workingset_update', [workingSet], function(result) {
        callback(result);
      })
    }
  }])
  .factory('semdomtransEditorDataService', ['$q', 'editorDataService', 'semdomtransEditService', 'sessionService', 'semdomtransOfflineCache', 'commentsOfflineCache', 'silNoticeService', 'lexCommentService',
function($q, editorDataService, api, ss, semdomCache, commentsCache, notice, commentService) {

  editorDataService.registerEntryApi(api);
  var workingSets = [];
  var itemsTree = {};
  var loadingDto = false;
  var entries = editorDataService.entries;

  
  function constructSemdomTree(items) {
    for (var i in items) {
      var item = items[i];
      itemsTree[item.key] = { 'content': item, 'children': [], 'parent': ''};
      if (item.key.length >= 3) {
        itemsTree[item.key.substring(0, item.key.length - 2)].children.push(item.key);
        itemsTree[item.key].parent = item.key.substring(0, item.key.length - 2);
      }
    }
  }
  
  function createShowAllWorkingSet(items) {
    var allItemsWS = { id: '',  name: 'Show All', isShared : false, itemKeys : [] }
    
    for (var i in items) {
      allItemsWS.itemKeys.push(items[i].key);
    }
    
    return allItemsWS;
  }
  
  /**
   * Persists the Lexical data in the offline cache store
   */
  function storeDataInOfflineCache(data) {
    var deferred = $q.defer();
    semdomCache.updateWorkingSets(data).then(function() {
       deferred.resolve(); 
    });
    return deferred.promise;
  }
  
  /**
   * Persists the Lexical data in the offline cache store
   */
  function loadDataFromOfflineCache() {
    var deferred = $q.defer();
    semdomCache.getAllWorkingSets().then(function(result) {
        deferred.resolve(result);
    });
    return deferred.promise;
  }
  
  

  function processEditorDto(dtoResult) {
    var deferred = $q.defer();
    if (semdomCache.canCache() && workingSets.length == 0) {
      loadDataFromOfflineCache().then(function(cacheResult) {
        processWholeDto(cacheResult, dtoResult);
          deferred.resolve();
        }, function() {
          processWholeDto(dtoResult);
          deferred.resolve();
        });
    } else {
      spliceInDto(dtoResult);
    }
    
    return deferred.promise;
  }
  
  function spliceInDto(dtoResult) {
    // splicing in working sets
    for (var i in dtoResult.data.workingSets) {
      var ws = dtoResult.data.workingSets[i];
      var pos = findPos(workingSets, ws.id)
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
    loadingDto = false;
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
.factory('semdomtransOfflineCache', ['$window', '$q', 'sessionService', 'offlineCache', 'offlineCacheUtils', function($window, $q, sessionService, offlineCache, offlineCacheUtils) {
  var projectId = sessionService.session.project.id;
  
  var getAllWorkingSets = function getAllWorkingSets() {
    return offlineCache.getAllFromStore('workingsets', projectId);
  };

  var deleteWorkingSet = function deleteWorkingSet(id) {
    return offlineCache.deleteObjectInStore('workingsets', id);
  };

  /**
   *
   * @param working sets - array
   * @returns {promise}
   */
  var updateWorkingSets = function updateWorkingSets(workingSets) {
    return offlineCache.setObjectsInStore('workingsets', projectId, workingSets);
  };

  return {
    canCache: offlineCache.canCache,
    getAllWorkingSets: getAllWorkingSets,
    deleteWorkingSet: deleteWorkingSet,
    updateWorkingSets: updateWorkingSets
  };
}]);

  
  