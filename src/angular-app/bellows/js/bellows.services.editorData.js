'use strict';

angular.module('bellows.services')

// Lexicon Entry Service
.factory('editorDataService', ['$q', 'sessionService', 'editorOfflineCache', 'commentsOfflineCache', 'silNoticeService', 'lexCommentService',
function($q, ss, cache, commentsCache, notice, commentService) {

  var entries = [];
  var visibleEntries = [];
  var browserInstanceId = Math.floor(Math.random() * 1000);
  var api = undefined;

  var showInitialEntries = function showInitial() {
    visibleEntries.length = 0 // clear out the array
    visibleEntries.push.apply(visibleEntries, entries.slice(0, 50));
  };

  var showMoreEntries = function showMoreEntries() {
    var increment = 50;
    if (visibleEntries.length < entries.length) {
      var currentLength = visibleEntries.length;
      visibleEntries.length = 0;
      visibleEntries.push.apply(visibleEntries, entries.slice(0, currentLength + increment));
    }
  };

  var registerEntryApi = function registerEntryApi(a) {
   api = a;
  }
  
  /**
   * Called when loading the controller
   * @param callback
   * @return promise
   */
  var loadEditorData = function loadEditorData() {
    var deferred = $q.defer();
    if (entries.length == 0) { // first page load
      if (cache.canCache()) {
        notice.setLoading("Loading Dictionary");
        loadDataFromOfflineCache().then(function(projectObj) {
          if (projectObj.isComplete) {
            // data found in cache
            console.log("data successfully loaded from the cache.  Downloading updates...");
            notice.setLoading('Downloading Updates to Dictionary.');
            showInitialEntries();
            refreshEditorData(projectObj.timestamp).then(function(result) {
              deferred.resolve(result);
              notice.cancelLoading();
            });

          } else {
            entries = [];
            console.log("cached data was found to be incomplete. Full download started...");
            notice.setLoading('Downloading Full Dictionary.');
            notice.setPercentComplete(0);
            doFullRefresh().then(function(result) {
              deferred.resolve(result);
              notice.setPercentComplete(100);
              notice.cancelLoading();
            });
          }


        }, function() {
          // no data found in cache
          console.log("no data found in cache. Full download started...");
          notice.setLoading('Downloading Full Dictionary.');
          notice.setPercentComplete(0);
          doFullRefresh().then(function(result) {
            deferred.resolve(result);
            notice.setPercentComplete(100);
            notice.cancelLoading();
          });
        });
      } else {
        console.log("caching not enabled. Full download started...");
        notice.setLoading('Downloading Full Dictionary.');
        notice.setPercentComplete(0);
        doFullRefresh().then(function(result) {
          deferred.resolve(result);
          notice.setPercentComplete(100);
          notice.cancelLoading();
        });
      }
    } else {
      // intentionally not showing any loading message here
      refreshEditorData().then(function(result) {
        deferred.resolve(result);
      });
    }
    return deferred.promise;
  };

  function doFullRefresh(offset) {
    offset = offset || 0;
    var deferred = $q.defer();
    api.dbeDtoFull(browserInstanceId, offset, function(result) {
      var newOffset = offset + result.data.itemCount, totalCount = result.data.itemTotalCount;
      notice.setPercentComplete(parseInt(newOffset * 100 / totalCount));
      processEditorDto(result, false).then(function() {
        if (offset == 0) {
          showInitialEntries();
        }
        if (newOffset < totalCount) {
          doFullRefresh(newOffset).then(function() {
            deferred.resolve(result);
          });
        } else {
          deferred.resolve(result);
        }
      });
    });
    return deferred.promise;
  }

  /**
   * Call this after every action that requires a pull from the server
   * @param timestamp
   * @return promise
   */
  var refreshEditorData = function refreshEditorData(timestamp) {
    var deferred = $q.defer();
    // get data from the server
    api.dbeDtoUpdatesOnly(browserInstanceId, timestamp, function(result) {
      processEditorDto(result, true).then(function(result) {
        deferred.resolve(result);
      });
    });
    return deferred.promise;
  };

  var addEntryToEntryList = function addEntryToEntryList(entry) {
    entries.unshift(entry);
  };


  var removeEntryFromLists = function removeEntryFromLists(id) {
    // todo: make this method async, returning a promise

    cache.deleteEntry(id).then(function() {
      var iFullList = getIndexInList(id, entries);
      if (angular.isDefined(iFullList)) {
        entries.splice(iFullList, 1);
      }
      var iShowList = getIndexInList(id, visibleEntries);
      if (angular.isDefined(iShowList)) {
        visibleEntries.splice(iShowList, 1);
      }
    });
  };

  /**
   * Persists the Lexical data in the offline cache store
   */
  function storeDataInOfflineCache(data, isComplete) {
    var deferred = $q.defer();
    if (data.timeOnServer && cache.canCache()) {
      cache.updateProjectData(data.timeOnServer, data.commentsUserPlusOne, isComplete).then(function() {
        cache.updateEntries(data.entries).then(function() {
          commentsCache.updateComments(data.comments).then(function() {
            deferred.resolve();
          });
        });
      });
    } else {
      deferred.reject();
    }
    return deferred.promise;
  }

  /**
   *
   * @returns {promise} which resolves to an project object containing the epoch cache timestamp
   */
  function loadDataFromOfflineCache() {
    var startTime = performance.now(), endTime;
    var deferred = $q.defer();
    var numOfEntries;
    cache.getAllEntries().then(function(result) {
      entries.push.apply(entries, result); // proper way to extend the array
      numOfEntries = result.length;

      if (result.length > 0) {
        commentsCache.getAllComments().then(function(result) {
          commentService.comments.items.all.push.apply(commentService.comments.items.all, result);

          cache.getProjectData().then(function(result) {
            commentService.comments.counts.userPlusOne = result.commentsUserPlusOne;
            endTime = performance.now();
            console.log("Loaded " + numOfEntries + " entries from the cache in " + ((endTime - startTime) / 1000).toFixed(2) + " seconds");
            deferred.resolve(result);

          }, function() { deferred.reject(); });
        }, function() { deferred.reject(); });
      } else {
        // we got zero entries
        deferred.reject();
      }

    }, function() { deferred.reject(); });
    return deferred.promise;
  }


  function processEditorDto(result, updateOnly) {
    var deferred = $q.defer();
    var isLastRequest = true;
    if (result.ok) {
      commentService.comments.counts.userPlusOne = result.data.commentsUserPlusOne;
      if (!updateOnly) {
        entries.push.apply(entries, result.data.entries); // proper way to extend the array
        commentService.comments.items.all.push.apply(commentService.comments.items.all, result.data.comments);
      } else {

        // splice updates into entry lists
        angular.forEach(result.data.entries, function(e) {
          var i;

          // splice into entries
          i = getIndexInList(e.id, entries);
          if (angular.isDefined(i)) {
            entries[i] = e;
          } else {
            addEntryToEntryList(e);
          }

          // splice into visibleEntries
          i = getIndexInList(e.id, visibleEntries);
          if (angular.isDefined(i)) {
            visibleEntries[i] = e;
          } else {
            // don't do anything. The entry is not in view so we don't need to update it
          }
        });

        // splice comment updates into comments list
        angular.forEach(result.data.comments, function(c) {
          var i = getIndexInList(c.id, commentService.comments.items.all);
          if (angular.isDefined(i)) {
            commentService.comments.items.all[i] = c;
          } else {
            commentService.comments.items.all.push(c);
          }
        });

        // remove deleted entries according to deleted ids
        angular.forEach(result.data.deletedEntryIds, removeEntryFromLists);

        angular.forEach(result.data.deletedCommentIds, commentService.removeCommentFromLists);

        // todo: maybe sort both lists after splicing in updates ???
      }


      if (result.data.itemCount && result.data.itemCount + result.data.offset < result.data.itemTotalCount) {
        isLastRequest = false;
      }


      storeDataInOfflineCache(result.data, isLastRequest).then(function() { deferred.resolve(); });
      commentService.updateGlobalCommentCounts();
      deferred.resolve(result);
      return deferred.promise;
    }
  }

  function getIndexInList(id, list) {
    var index = undefined;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.id == id) {
        index = i;
        break;
      }
    }
    return index;
  }

  return {
    loadDataFromOfflineCache: loadDataFromOfflineCache,
    storeDataInOfflineCache: storeDataInOfflineCache,
    processEditorDto: processEditorDto,
    registerEntryApi: registerEntryApi,
    loadEditorData: loadEditorData,
    refreshEditorData: refreshEditorData,
    removeEntryFromLists: removeEntryFromLists,
    addEntryToEntryList: addEntryToEntryList,
    entries: entries,
    visibleEntries: visibleEntries,
    showInitialEntries: showInitialEntries,
    showMoreEntries: showMoreEntries
  };

}]);
