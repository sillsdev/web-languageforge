'use strict';

angular.module('bellows.services')

// Lexicon Entry Service
.factory('editorDataService', ['$q', 'sessionService', 'editorOfflineCache', 'commentsOfflineCache',
  'silNoticeService', 'lexCommentService',
function ($q, sessionService, cache, commentsCache,
          notice, commentService) {

  var config = sessionService.session.projectSettings.config;
  var entries = [];
  var visibleEntries = [];
  var browserInstanceId = Math.floor(Math.random() * 1000);
  var api = undefined;

  var showInitialEntries = function showInitialEntries() {
    sortList(entries);
    visibleEntries.length = 0; // clear out the array
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
  };

  /**
   * Called when loading the controller
   * @return promise
   */
  var loadEditorData = function loadEditorData() {
    var deferred = $q.defer();
    if (entries.length == 0) { // first page load
      if (cache.canCache()) {
        notice.setLoading('Loading Dictionary');
        loadDataFromOfflineCache().then(function (projectObj) {
          if (projectObj.isComplete) {
            // data found in cache
            console.log('data successfully loaded from the cache.  Downloading updates...');
            notice.setLoading('Downloading Updates to Dictionary.');
            showInitialEntries();
            refreshEditorData(projectObj.timestamp).then(function (result) {
              deferred.resolve(result);
              notice.cancelLoading();
            });

          } else {
            entries = [];
            console.log('cached data was found to be incomplete. Full download started...');
            notice.setLoading('Downloading Full Dictionary.');
            notice.setPercentComplete(0);
            doFullRefresh().then(function (result) {
              deferred.resolve(result);
              notice.setPercentComplete(100);
              notice.cancelLoading();
            });
          }

        }, function () {
          // no data found in cache
          console.log('no data found in cache. Full download started...');
          notice.setLoading('Downloading Full Dictionary.');
          notice.setPercentComplete(0);
          doFullRefresh().then(function (result) {
            deferred.resolve(result);
            notice.setPercentComplete(100);
            notice.cancelLoading();
          });
        });
      } else {
        console.log('caching not enabled. Full download started...');
        notice.setLoading('Downloading Full Dictionary.');
        notice.setPercentComplete(0);
        doFullRefresh().then(function (result) {
          deferred.resolve(result);
          notice.setPercentComplete(100);
          notice.cancelLoading();
        });
      }
    } else {
      // intentionally not showing any loading message here
      refreshEditorData().then(function (result) {
        deferred.resolve(result);
      });
    }

    return deferred.promise;
  };

  function doFullRefresh(offset) {
    offset = offset || 0;
    var deferred = $q.defer();
    api.dbeDtoFull(browserInstanceId, offset, function (result) {
      if (!result.ok) {
        notice.cancelLoading();
        deferred.error(result);
        return;
      }

      var newOffset = offset + result.data.itemCount;
      var totalCount = result.data.itemTotalCount;
      notice.setPercentComplete(parseInt(newOffset * 100 / totalCount));
      processEditorDto(result, false).then(function () {
        if (offset == 0) {
          showInitialEntries();
        }

        if (newOffset < totalCount) {
          doFullRefresh(newOffset).then(function () {
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
    api.dbeDtoUpdatesOnly(browserInstanceId, timestamp, function (result) {
      processEditorDto(result, true).then(function (result) {
        deferred.resolve(result);
      });
    });

    return deferred.promise;
  };

  var addEntryToEntryList = function addEntryToEntryList(entry) {
    entries.unshift(entry);
  };

  var removeEntryFromLists = function removeEntryFromLists(id) {
    var iFullList = getIndexInList(id, entries);
    if (angular.isDefined(iFullList)) {
      entries.splice(iFullList, 1);
    }

    var iShowList = getIndexInList(id, visibleEntries);
    if (angular.isDefined(iShowList)) {
      visibleEntries.splice(iShowList, 1);
    }

    return cache.deleteEntry(id);
  };

  /**
   * Persists the Lexical data in the offline cache store
   */
  function storeDataInOfflineCache(data, isComplete) {
    var deferred = $q.defer();
    if (data.timeOnServer && cache.canCache()) {
      cache.updateProjectData(data.timeOnServer, data.commentsUserPlusOne, isComplete)
        .then(function () {
          cache.updateEntries(data.entries).then(function () {
            commentsCache.updateComments(data.comments).then(function () {
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
    var startTime = performance.now();
    var deferred = $q.defer();
    var endTime;
    var numOfEntries;
    cache.getAllEntries().then(function (result) {
      entries.push.apply(entries, result); // proper way to extend the array
      numOfEntries = result.length;

      if (result.length > 0) {
        commentsCache.getAllComments().then(function (result) {
          commentService.comments.items.all.push.apply(commentService.comments.items.all, result);

          cache.getProjectData().then(function (result) {
            commentService.comments.counts.userPlusOne = result.commentsUserPlusOne;
            endTime = performance.now();
            console.log('Loaded ' + numOfEntries + ' entries from the cache in ' +
              ((endTime - startTime) / 1000).toFixed(2) + ' seconds');
            deferred.resolve(result);

          }, function () { deferred.reject(); });
        }, function () { deferred.reject(); });
      } else {
        // we got zero entries
        deferred.reject();
      }

    }, function () { deferred.reject(); });

    return deferred.promise;
  }

  function processEditorDto(result, updateOnly) {
    var deferred = $q.defer();
    var isLastRequest = true;
    if (result.ok) {
      commentService.comments.counts.userPlusOne = result.data.commentsUserPlusOne;
      if (!updateOnly) {
        entries.push.apply(entries, result.data.entries); // proper way to extend the array
        commentService.comments.items.all.push
          .apply(commentService.comments.items.all, result.data.comments);
      } else {

        // splice updates into entry lists
        angular.forEach(result.data.entries, function (e) {
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
          }
        });

        // splice comment updates into comments list
        angular.forEach(result.data.comments, function (c) {
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

        sortList(entries);
        sortList(visibleEntries);
      }

      if (result.data.itemCount &&
          result.data.itemCount + result.data.offset < result.data.itemTotalCount) {
        isLastRequest = false;
      }

      storeDataInOfflineCache(result.data, isLastRequest).then(function () { deferred.resolve(); });

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

  function getIndexInEntries(id) {
    return getIndexInList(id, entries);
  }

  function getIndexInVisibleEntries(id) {
    return getIndexInList(id, visibleEntries);
  }

  function sortList(list) {
    var inputSystems = config.entry.fields.lexeme.inputSystems;
    var lexemeA = '';
    var lexemeB = '';
    list.sort(function (a, b) {
      var x;
      var ws;
      for (x = 0; x < inputSystems.length; x++) {
        ws = inputSystems[x];
        if (angular.isDefined(a.lexeme) && angular.isDefined(a.lexeme[ws])) {
          lexemeA = a.lexeme[ws].value;
          break;
        }
      }

      for (x = 0; x < inputSystems.length; x++) {
        ws = inputSystems[x];
        if (angular.isDefined(b.lexeme) && angular.isDefined(b.lexeme[ws])) {
          lexemeB = b.lexeme[ws].value;
          break;
        }
      }

      if (lexemeA > lexemeB) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * A function useful for debugging (prints out to the console the lexeme values)
   * @param list
   */
  function printLexemesInList(list) {
    var ws = config.entry.fields.lexeme.inputSystems[1];
    var arr = [];
    for (var i = 0; i < list.length; i++) {
      if (angular.isDefined(list[i].lexeme[ws])) {
        arr.push(list[i].lexeme[ws].value);
      }
    }

    console.log(arr);
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
    getIndexInEntries: getIndexInEntries,
    getIndexInVisibleEntries: getIndexInVisibleEntries,
    entries: entries,
    visibleEntries: visibleEntries,
    showInitialEntries: showInitialEntries,
    showMoreEntries: showMoreEntries
  };

}]);
