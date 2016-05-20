'use strict';

angular.module('lexicon.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.entry', 'palaso.ui.comments', 'palaso.ui.showOverflow', 'ngAnimate', 'truncate', 'lexicon.services', 'palaso.ui.scroll', 'palaso.ui.notice'])
// DBE controller
.controller('editCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$interval', '$filter', 'lexLinkService', 'lexUtils', 'modalService', 'silNoticeService', '$route', '$rootScope', '$location', 'lexConfigService', 'lexCommentService', 'offlineCache', '$q', 'lexProjectService',
function($scope, userService, sessionService, lexService, $window, $interval, $filter, linkService, utils, modal, notice, $route, $rootScope, $location, configService, commentService, offlineCache, $q, lexProjectService) {

  // TODO use ui-router for this instead!

  var pristineEntry = {};
  var browserInstanceId = Math.floor(Math.random() * 1000);
  $scope.config = configService.getConfigForUser();
  $scope.lastSavedDate = new Date();
  $scope.currentEntry = {};
  $scope.commentService = commentService; // tie service into the edit.html template

  // default state. State is one of 'list', 'edit', or 'comment'
  $scope.state = 'list';
  lexProjectService.setBreadcrumbs('dbe', 'Edit');

  // Note: $scope.entries is declared on the MainCtrl so that each view refresh
  // will not cause a full dictionary reload

  $scope.currentEntryIsDirty = function() {
    if ($scope.entryLoaded()) {
      if (entryIsNew($scope.currentEntry)) {
        return true;
      }
      return !angular.equals($scope.currentEntry, pristineEntry);
    }
    return false;
  };

  function entryIsNew(entry) {
    if (entry.id && entry.id.indexOf('_new_') == 0) {
      return true;
    }
    return false;
  }


  // for test purposes only
  $scope.getIds = function() {
    var ids = [];
    angular.forEach($scope.show.entries, function(e) { ids.push(e.id); })
    return ids;
  };

  // Reviewed CP 2014-08: Um, shouldn't these two be mutually exclusive.
  var saving = false;
  var saved = false;

  $scope.saveNotice = function() {
    if (saving) {
      return "Saving";
    }
    if (saved) {
      return "Saved";
    }
    return "";
  };
  $scope.saveButtonTitle = function() {
    if ($scope.currentEntryIsDirty()) {
      return "Save Entry";
    } else {
      return "Entry saved";
    }
  };

  $scope.saveCurrentEntry = function saveCurrentEntry(doSetEntry, successCallback, failCallback) {
    var isNewEntry = false, newEntryTempId;
    if (angular.isUndefined(doSetEntry)) {
      // doSetEntry is mainly used for when the save button is pressed,
      // that is when the user is saving the current entry and is NOT going to a
      // different entry (as is the case with editing another entry
      doSetEntry = false;
    }
    if ($scope.currentEntryIsDirty() && $scope.rights.canEditEntry()) {
      cancelAutoSaveTimer();
      saving = true;
      var entryToSave = angular.copy($scope.currentEntry);
      if (entryIsNew(entryToSave)) {
        isNewEntry = true;
        newEntryTempId = entryToSave.id;
        entryToSave.id = ''; // send empty id which indicated "create new"
      }
      lexService.update(prepEntryForUpdate(entryToSave), function(result) {
        if (result.ok) {
          var entry = result.data;
          if (isNewEntry) {
            // note: we have to reset the show window, because we don't know
            // where the new entry will show up in the list
            // we can solve this problem by implementing a sliding "scroll
            // window" that only shows a few entries at a time (say 30?)
            $scope.show.initial();
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

          /* Reviewed CJH 2015-03: setCurrentEntry is useful in the case when the entry being saved is a new entry.
             In this case the new entry is replaced entirely by the one returned from the server (with a proper id, etc).
             I'm currently unclear on whether the doSetEntry parameter is still necessary
           *
           */

          pristineEntry = angular.copy(entryToSave);
          $scope.lastSavedDate = new Date();

          // refresh data will add the new entry to the entries list
          $scope.refreshDbeData().then(function() {
            if (isNewEntry) {
              setCurrentEntry($scope.entries[getIndexInList(entry.id, $scope.entries)]);
              removeEntryFromLists(newEntryTempId);
              if (doSetEntry) {
                scrollListToEntry(entry.id, 'top');
              }
            }
          });
          saved = true;
          (successCallback || angular.noop)(result);
        } else {
          (failCallback || angular.noop)(result);
        }
        saving = false;
      });
    }
  };

  function prepEntryForUpdate(entry) {
    var entryForUpdate = recursiveRemoveProperties(angular.copy(entry), ['guid', 'mercurialSha', 'authorInfo', 'dateCreated', 'dateModified', 'liftId', '$$hashKey']);
    entryForUpdate = prepCustomFieldsForUpdate(entryForUpdate);
    return entryForUpdate;
  }

  $scope.getWordForDisplay = function getWordForDisplay(entry) {
    var lexeme = utils.getLexeme($scope.config.entry, entry);
    if (!lexeme) {
      return '[Empty]';
    }
    return lexeme;
  };

  $scope.lexemeAlign = function lexemeAlign(listEntry) {
    if ($scope.config && $scope.config.entry && listEntry.lexeme) {
      var inputSystem = $scope.config.entry.fields.lexeme.inputSystems[0];
      return ($scope.config.inputSystems[inputSystem].isRightToLeft) ? 'right' : 'left';
    } else {
      return 'left';
    }
  };

  $scope.getMeaningForDisplay = function getMeaningForDisplay(entry) {
    var meaning = '';
    if (entry.senses && entry.senses[0]) {
      meaning = utils.getMeaning($scope.config.entry.fields.senses, entry.senses[0]);
    }
    if (!meaning) {
      return '[Empty]';
    }
    return meaning;
  };

  $scope.definitionOrGlossAlign = function definitionOrGlossAlign(listEntry) {
    if ($scope.config && $scope.config.entry && $scope.config.entry.fields.senses) {
      if (listEntry.definition) {
        var inputSystem = $scope.config.entry.fields.senses.fields.definition.inputSystems[0];
        return ($scope.config.inputSystems[inputSystem].isRightToLeft) ? 'right' : 'left';
      } else if (listEntry.gloss) {
        var inputSystem = $scope.config.entry.fields.senses.fields.gloss.inputSystems[0];
        return ($scope.config.inputSystems[inputSystem].isRightToLeft) ? 'right' : 'left';
      }
    } else {
      return 'left';
    }
  };

  $scope.navigateToLiftImport = function navigateToLiftImport() {
    $location.path('/importExport');
  };

  function _scrollDivToId(containerId, divId, posOffset) {
    var offsetTop, div = $(divId), containerDiv = $(containerId);
    var foundDiv = false;
    if (angular.isUndefined(posOffset)) {
      posOffset = 0;
    }

    // todo: refactor this spaghetti logic
    if (div && containerDiv) {
      if (angular.isUndefined(div.offsetTop)) {
        if (angular.isDefined(div[0])) {
          div = div[0];
          foundDiv = true;
        } else {
          console.log('Error: unable to scroll to div with div id ' + divId);
        }
      }
      if (foundDiv) {
        if (angular.isUndefined(div.offsetTop)) {

          offsetTop = div.offset().top - posOffset;
        } else {
          offsetTop = div.offsetTop - posOffset;
        }
        if (offsetTop < 0)
          offsetTop = 0;
        containerDiv.scrollTop(offsetTop);
      }
    }
  }

  function scrollListToEntry(id, position) {
    var posOffset = (position == 'top') ? 237 : 450;
    var index, entryDivId = '#entryId_' + id, listDivId = '#compactEntryListContainer';

    // make sure the item is visible in the list
    // todo implement lazy "up" scrolling to make this more efficient

    // only expand the "show window" if we know that the entry is actually in
    // the entry list - a safe guard
    if (angular.isDefined(getIndexInList(id, $scope.entries))) {
      while ($scope.show.entries.length < $scope.entries.length) {
        index = getIndexInList(id, $scope.show.entries);
        if (angular.isDefined(index)) {
          break;
        }
        $scope.show.more();
      }
    } else {
      throw 'Error: tried to scroll to an entry that is not in the entry list!';
    }

    // note: ':visible' is a JQuery invention that means 'it takes up space on
    // the page'.
    // It may actually not be visible at the moment because it may down inside a
    // scrolling div or scrolled off the view of the page
    if ($(listDivId).is(':visible') && $(entryDivId).is(':visible')) {
      _scrollDivToId(listDivId, entryDivId, posOffset);
    } else {
      // wait then try to scroll
      $interval(function() {
        _scrollDivToId(listDivId, entryDivId, posOffset);
      }, 200, 1);
    }
  }
  ;

  $scope.editEntryAndScroll = function editEntryAndScroll(id) {
    $scope.editEntry(id);
    scrollListToEntry(id, 'middle');
  };

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
  ;

  function setCurrentEntry(entry) {
    entry = entry || {};

    // align custom fields into model
    entry = alignCustomFieldsInData(entry);

    // auto-make a valid model but stop at the examples array
    entry = $scope.makeValidModelRecursive($scope.config.entry, entry, 'examples');

    $scope.currentEntry = entry;
    pristineEntry = angular.copy(entry);
    saving = false; // This should be redundant.
    saved = false;
  }

  function alignCustomFieldsInData(data) {
    if (angular.isDefined(data['customFields'])) {
      angular.forEach(data['customFields'], function(item, key) {
        data[key] = item;
      });
    }
    if (angular.isDefined(data['senses'])) {
      angular.forEach(data['senses'], function(sense) {
        sense = alignCustomFieldsInData(sense);
      });
    }
    if (angular.isDefined(data['examples'])) {
      angular.forEach(data['examples'], function(example) {
        example = alignCustomFieldsInData(example);
      });
    }
    return data;
  }

  function prepCustomFieldsForUpdate(data) {
    data['customFields'] = {};
    angular.forEach(data, function(item, key) {
      if (/^customField_/.test(key)) {
        data['customFields'][key] = item;
      }
      if (key == 'senses' || key == 'examples') {
        data[key] = prepCustomFieldsForUpdate(item);
      }
    });
    return data;

  }

  $scope.editEntry = function editEntry(id) {
    if ($scope.currentEntry.id != id) {
      $scope.saveCurrentEntry();
      setCurrentEntry($scope.entries[getIndexInList(id, $scope.entries)]);
      commentService.loadEntryComments(id);
    }
    $scope.state = 'edit';
    // $location.path('/dbe/' + id, false);
  };

  $scope.newEntry = function newEntry() {
    // TODO: saveCurrentEntry should return a promise that we can then add a new word after the current one has been saved - cjh 2015-03
    $scope.saveCurrentEntry();
    var d = new Date();
    var uniqueId = '_new_' + d.getSeconds() + d.getMilliseconds();
    var newEntry = {
      id: uniqueId
    };
    setCurrentEntry(newEntry);
    commentService.loadEntryComments(uniqueId);
    addEntryToEntryList(newEntry);
    $scope.show.initial();
    scrollListToEntry(uniqueId, 'top');
    $scope.state = 'edit';
    // $location.path('/dbe', false);
  };

  $scope.entryLoaded = function entryLoaded() {
    return angular.isDefined($scope.currentEntry.id);
  };

  $scope.returnToList = function returnToList() {
    $scope.saveCurrentEntry();
    setCurrentEntry();
    $scope.state = 'list';
    // $location.path('/dbe', false);
  };

  function removeEntryFromLists(id) {
    var iFullList = getIndexInList(id, $scope.entries);
    if (angular.isDefined(iFullList)) {
      $scope.entries.splice(iFullList, 1);
      /*
       * not yet implemented if ($scope.show.startOfWindow != 0) {
       * $scope.show.startOfWindow--; }
       */
    }
    var iShowList = getIndexInList(id, $scope.show.entries);
    if (angular.isDefined(iShowList)) {
      $scope.show.entries.splice(iShowList, 1);
    }
  }

  function addEntryToEntryList(entry) {
    $scope.entries.unshift(entry);
  }

  $scope.makeValidModelRecursive = function makeValidModelRecursive(config, data, stopAtNodes) {
    if (angular.isString(stopAtNodes)) {
      var node = stopAtNodes;
      stopAtNodes = [];
      stopAtNodes.push(node);
    } else if (angular.isArray(stopAtNodes)) {
      // array
    } else {
      stopAtNodes = [];
    }

    switch (config.type) {
      case 'fields':
        angular.forEach(config.fieldOrder, function(f) {
          if (angular.isUndefined(data[f])) {
            if (config.fields[f].type == 'fields' || config.fields[f].type == 'pictures') {
              data[f] = [];
            } else {
              data[f] = {};
            }
          }

          // only recurse if the field is not in our node stoplist
          if (stopAtNodes.indexOf(f) == -1) {
            if (config.fields[f].type == 'fields') {
              if (data[f].length == 0) {
                data[f].push({});
              }
              for (var i = 0; i < data[f].length; i++) {
                data[f][i] = $scope.makeValidModelRecursive(config.fields[f], data[f][i], stopAtNodes);
              }
            } else {
              data[f] = $scope.makeValidModelRecursive(config.fields[f], data[f], stopAtNodes);
            }
          }
        });
        break;
      case 'multitext':
        // when a multitext is completely empty for a field, and sent down the
        // wire, it will come as a [] because of the way
        // that the PHP JSON default encode works. We change this to be {} for
        // an empty multitext
        if (angular.isArray(data)) {
          data = {};
        }
        angular.forEach(config.inputSystems, function(ws) {
          if (angular.isUndefined(data[ws])) {
            data[ws] = {
              value: ''
            };
          }
        });
        break;
      case 'optionlist':
        if (angular.isUndefined(data.value) || data.value == null) {
          data.value = '';
          if (angular.isDefined($scope.config.optionlists) && angular.isDefined(config.listCode) &&
              (config.listCode in $scope.config.optionlists) && 
              angular.isDefined($scope.config.optionlists[config.listCode].defaultItemKey)) {
            data.value = $scope.config.optionlists[config.listCode].defaultItemKey;
          }
        }
        break;
      case 'multioptionlist':
        if (angular.isUndefined(data.values)) {
          data.values = [];
        }
        break;
      case 'pictures':
        var captionConfig = angular.copy(config);
        captionConfig.type = 'multitext';
        if (angular.isUndefined(data)) {
          data = [];
        }
        angular.forEach(data, function(picture) {
          if (angular.isUndefined(picture.caption)) {
            picture.caption = {};
          }
          picture.caption = $scope.makeValidModelRecursive(captionConfig, picture.caption);
        });
        break;
    }
    // console.log('end data: ', data);
    return data;
  };

  $scope.deleteEntry = function deleteEntry(entry) {
    var deletemsg = "Are you sure you want to delete the word <b>' " + utils.getLexeme($scope.config.entry, entry) + " '</b>";
    // var deletemsg = $filter('translate')("Are you sure you want to delete '{lexeme}'?", {lexeme:utils.getLexeme($scope.config.entry, entry)});
    modal.showModalSimple('Delete Word', deletemsg, 'Cancel', 'Delete Word').then(function() {
      var iShowList = getIndexInList(entry.id, $scope.show.entries);
      removeEntryFromLists(entry.id);
      if ($scope.entries.length > 0) {
        if (iShowList != 0)
          iShowList--;
        setCurrentEntry($scope.show.entries[iShowList]);
      } else {
        $scope.returnToList();
      }
      if (!entryIsNew(entry)) {
        lexService.remove(entry.id, angular.noop);
      }
    });
  };

  /* TODO implement a proper sliding window that can go back and forward */
  $scope.show = {
    emptyFields: false,
    // startOfWindow: 0,
    entries: []
  };
  $scope.show.initial = function showInitial() {
    // var windowSize = 50;
    $scope.show.entries = $scope.entries.slice(0, 50);
  };
  $scope.show.more = function showMore() {
    var increment = 50;

    if (this.entries.length < $scope.entries.length) {
      this.entries = $scope.entries.slice(0, this.entries.length + increment);
    }
  };

  $scope.getCompactItemListOverlay = function getCompactItemListOverlay(entry) {
    var title, subtitle;
    title = $scope.getWordForDisplay(entry);
    subtitle = $scope.getMeaningForDisplay(entry);
    if (title.length > 19 || subtitle.length > 25) {
      return title + '         ' + subtitle;
    } else {
      return '';
    }
  };

  /**
   * Called when loading the controller
   * @param callback
   * @return promise
   */
  function loadDbeData() {
    var deferred = $q.defer();
    if ($scope.entries.length == 0) { // first page load
      if (offlineCache.canCache()) {
        notice.setLoading("Loading Dictionary");
        loadDataFromOfflineCache().then(function(projectObj) {
          if (projectObj.isComplete) {
            // data found in cache
            console.log("data successfully loaded from the cache.  Downloading updates...");
            notice.setLoading('Downloading Updates to Dictionary.');
            $scope.show.initial();
            $scope.refreshDbeData(projectObj.timestamp).then(function() {
              deferred.resolve();
              notice.cancelLoading();
            });

          } else {
            $scope.entries = [];
            console.log("cached data was found to be incomplete. Full download started...");
            notice.setLoading('Downloading Full Dictionary.');
            notice.setPercentComplete(0);
            doFullRefresh().then(function() {
              deferred.resolve();
              notice.setPercentComplete(100);
              notice.cancelLoading();
            });
          }


        }, function() {
          // no data found in cache
          console.log("no data found in cache. Full download started...");
          notice.setLoading('Downloading Full Dictionary.');
          notice.setPercentComplete(0);
          doFullRefresh().then(function() {
            deferred.resolve();
            notice.setPercentComplete(100);
            notice.cancelLoading();
          });
        });
      } else {
        console.log("caching not enabled. Full download started...");
        notice.setLoading('Downloading Full Dictionary.');
        notice.setPercentComplete(0);
        doFullRefresh().then(function() {
          deferred.resolve();
          notice.setPercentComplete(100);
          notice.cancelLoading();
        });
      }
    } else {
      // intentionally not showing any loading message here
      $scope.refreshDbeData().then(function() {
        deferred.resolve();
      });
    }
    return deferred.promise;
  }

  function doFullRefresh(offset) {
    offset = offset || 0;
    var deferred = $q.defer();
    lexService.dbeDtoFull(browserInstanceId, offset, function(result) {
      var newOffset = offset + result.data.itemCount, totalCount = result.data.itemTotalCount;
      notice.setPercentComplete(parseInt(newOffset * 100 / totalCount));
      processDbeDto(result, false).then(function() {
        if (offset == 0) {
          $scope.show.initial();
        }
        if (newOffset < totalCount) {
          doFullRefresh(newOffset).then(function() {
            deferred.resolve();
          });
        } else {
          deferred.resolve();
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
  $scope.refreshDbeData = function refreshDbeData(timestamp) {
    var deferred = $q.defer();
    // get data from the server
    lexService.dbeDtoUpdatesOnly(browserInstanceId, timestamp, function(result) {
      processDbeDto(result, true).then(function() {
        deferred.resolve();
      });
    });
    return deferred.promise;
  }


  /**
   * Persists the Lexical data in the offline cache store
   */
  function storeDataInOfflineCache(data, isComplete) {
    var deferred = $q.defer();
    if (data.timeOnServer && offlineCache.canCache()) {
      offlineCache.updateProjectData(data.timeOnServer, data.commentsUserPlusOne, isComplete).then(function() {
        offlineCache.updateEntries(data.entries).then(function() {
          offlineCache.updateComments(data.comments).then(function() {
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
    offlineCache.getAllEntries().then(function(result) {
      $scope.entries = result;
      numOfEntries = result.length;

      if (result.length > 0) {
        offlineCache.getAllComments().then(function(result) {
          commentService.comments.items.all = result;

          offlineCache.getProjectData().then(function(result) {
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


  function processDbeDto(result, updateOnly) {
    var deferred = $q.defer();
    var isLastRequest = true;
    if (result.ok) {
      commentService.comments.counts.userPlusOne = result.data.commentsUserPlusOne;
      if (!updateOnly) {
        $scope.entries.push.apply($scope.entries, result.data.entries); // proper way to extend the array
        commentService.comments.items.all.push.apply(commentService.comments.items.all, result.data.comments);
      } else {

        // splice updates into entry lists
        angular.forEach(result.data.entries, function(e) {
          var i;

          // splice into $scope.entries
          i = getIndexInList(e.id, $scope.entries);
          if (angular.isDefined(i)) {
            $scope.entries[i] = e;
          } else {
            addEntryToEntryList(e);
          }

          // splice into $scope.show.entries
          i = getIndexInList(e.id, $scope.show.entries);
          if (angular.isDefined(i)) {
            $scope.show.entries[i] = e;
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

        // todo remove deleted comments according to deleted ids
        angular.forEach(result.data.deletedCommentIds, function(id) {
          var i = getIndexInList(id, commentService.comments.items.all);
          if (angular.isDefined(i)) {
            commentService.comments.items.all.splice(i, 1);
          }
        });

        // todo: maybe sort both lists after splicing in updates ???
        sortList($scope.entries);
        sortList($scope.show.entries);
      }


      if (result.data.itemCount && result.data.itemCount + result.data.offset < result.data.itemTotalCount) {
        isLastRequest = false;
      }


      storeDataInOfflineCache(result.data, isLastRequest).then(function() { deferred.resolve(); });
      commentService.updateGlobalCommentCounts();
      return deferred.promise;
    }
  }

  function sortList(list) {
    var inputSystems = $scope.config.entry.fields.lexeme.inputSystems;
    var lexemeA = '';
    var lexemeB = '';
    list.sort(function (a, b) {
      for (var x = 0; x < inputSystems.length; x++) {
        var ws = inputSystems[x];
        if (angular.isDefined(a.lexeme[ws])) {
          lexemeA = a.lexeme[ws].value;
          break;
        }
      }

      for (var x = 0; x < inputSystems.length; x++) {
        var ws = inputSystems[x];
        if (angular.isDefined(b.lexeme[ws])) {
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

  function evaluateState() {
    var match, path = $location.path();
    // TODO implement this using ui-router!!!

    var goToState = function goToState() {
      match = /dbe\/(.+)\/comments/.exec(path);
      if (match) {
        $scope.show.initial();
        $scope.editEntryAndScroll(match[1]);
        $scope.showComments(match[1]);
        return;
      }

      match = /dbe\/(.+)$/.exec(path);
      if (match) {
        $scope.show.initial();
        $scope.editEntryAndScroll(match[1]);
        return;
      }

      $scope.returnToList();
    };

    loadDbeData().then(function() {
      $scope.finishedLoading = true;
      goToState();
    });
  }

  // Comments View


  $scope.showComments = function showComments() {
    $scope.saveCurrentEntry(true);
    $scope.state = 'comment';
    // $location.path('/dbe/' + $scope.currentEntry.id + '/comments', false);
  };
  






  // only refresh the full view if we have not yet loaded the dictionary for the first time
  evaluateState();

  var autoSaveTimer;
  function startAutoSaveTimer() {
    if (angular.isDefined(autoSaveTimer)) {
      return;
    }
    autoSaveTimer = $interval(function() {
      $scope.saveCurrentEntry(true);
    }, 5000, 1);
  }
  ;
  function cancelAutoSaveTimer() {
    if (angular.isDefined(autoSaveTimer)) {
      $interval.cancel(autoSaveTimer);
      autoSaveTimer = undefined;
    }
  }
  ;

  $scope.$on('$destroy', function() {
    cancelAutoSaveTimer();
    $scope.saveCurrentEntry();
  });

  $scope.$on('$locationChangeStart', function(event, next, current) {
    cancelAutoSaveTimer();
    $scope.saveCurrentEntry();
  });

  /*
   * $window.onbeforeunload = function (event) { var message =
   * $filter('translate')('You have unsaved changes.'); if (typeof event ==
   * 'undefined') { event = window.event; } if (! $scope.currentEntryIsDirty())
   * return; if (event) { event.returnValue = message; } return message; };
   */

  // hack to pass down the parent scope down into all child directives (i.e. entry, sense, etc)
  $scope.control = $scope;

  // permissions stuff
  $scope.rights = {
    canEditProject: function canEditProject() {
      return sessionService.hasProjectRight(sessionService.domain.PROJECTS, sessionService.operation.EDIT);
    },
    canEditEntry: function canEditEntry() {
      return sessionService.hasProjectRight(sessionService.domain.ENTRIES, sessionService.operation.EDIT);
    },
    canDeleteEntry: function canDeleteEntry() {
      return sessionService.hasProjectRight(sessionService.domain.ENTRIES, sessionService.operation.DELETE);
    }
  };

  // conditionally register watch
  if ($scope.rights.canEditEntry()) {
    $scope.$watch('currentEntry', function(newValue) {
      if (newValue != undefined) {
        cancelAutoSaveTimer();
        if ($scope.currentEntryIsDirty) {
          startAutoSaveTimer();
        }
      }
    }, true);
  }

  function recursiveRemoveProperties(startAt, properties) {
    angular.forEach(startAt, function(value, key) {
      var deleted = false;
      angular.forEach(properties, function(propName) {
        // console.log ("key = " + key + " && propName = " + propName);
        if (!deleted && key == propName) {
          // console.log("deleted " + key + " (" + startAt[key] + ")");
          delete startAt[key];
          deleted = true;
        }
      });
      if (!deleted && angular.isObject(value)) {
        recursiveRemoveProperties(startAt[key], properties);
      }
    });
    return startAt;
  }
  ;

  // search typeahead
  $scope.typeahead = {
    term: '',
    searchResults: []
  };
  $scope.typeahead.searchEntries = function searchEntries(query) {
    $scope.typeahead.searchResults = $filter('filter')($scope.entries, query);
  };

  $scope.typeahead.searchSelect = function searchSelect(entry) {
    $scope.typeahead.searchItemSelected = '';
    $scope.typeahead.searchResults = [];
    if (entry.id) {
      $scope.editEntryAndScroll(entry.id);
    }
  };

}]);
