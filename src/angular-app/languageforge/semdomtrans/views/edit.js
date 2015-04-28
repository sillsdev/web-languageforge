'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.sd.questions', 'palaso.ui.scroll', 'palaso.ui.typeahead', 'palaso.ui.sd.ws'])
// DBE controller
.controller('editCtrl', ['$scope', '$state', '$stateParams', 'semdomtransEditService', 'semdomtransEditorDataService', 'sessionService', 'modalService', 'silNoticeService', '$rootScope', '$filter', '$timeout',
function($scope, $state, $stateParams, semdomEditApi, editorDataService, sessionService, modal, notice, $rootScope, $filter, $timeout) {

  $scope.selectedTab = 0;
  $scope.control = $scope;
  $scope.currentQuestionPos = 0;
  $scope.tabDisplay = {"val": '0'};
  $scope.state = "edit";
  $scope.filteredByDepthItems = [];
  $scope.filteredByDepthItemsDict = {};
  $scope.displayedItems = [];
  $scope.selectedDepth = 1;
  $scope.searchText = "";
  $scope.isEditingWorkingSet = false;
  $scope.subDomain = "1";
  $scope.hideTranslated = false;
  
  var api = semdomEditApi;
 
  
  $scope.$watch("subDomain", function(newVal) {
    $scope.reloadItems($scope.selectedDepth);
  });
  
  $scope.selectSubDomain = function(subDomain) {
    $scope.subDomain = subDomain;
  }
  
  $scope.reloadItems = function reloadItems(depth, delay) {
     if (delay == undefined) {
       delay = 0;
     }
      var query = $scope.selectedText;
      $timeout(function() {
            if (query != $scope.selectedText)
              return;
            
            $scope.filteredByDepthItems = [];
            var addedToFiltered = {};
            
            // get all actually included items in
            for (var i in $scope.itemsTree) {
              var node = $scope.itemsTree[i];
              var item = node.content;
              if (isIncluded(item.key) && item.key[0] == $scope.subDomain) {
                if (checkDepth(item.key)) {
                  $scope.filteredByDepthItems.push(item);
                }
              }              
            }
            
            // apply filter       
            $scope.filteredByDepthItems = $filter('filter')($scope.filteredByDepthItems, $scope.searchText);
            
            // check off that items have been added (to avoid duplicates in next step)
            for (var i in $scope.filteredByDepthItems) {
              var item = $scope.filteredByDepthItems[i];
              addedToFiltered[item.key] = true;
            }
            
            // add ancestors of included items
            for (var i in $scope.filteredByDepthItems) {
              var node = $scope.itemsTree[$scope.filteredByDepthItems[i].key];
              var item = node.content;      
              if (isIncluded(item.key) && item.key[0] == $scope.subDomain) {
                while(node.parent != '') {
                  if (checkDepth(node.parent) && (angular.isUndefined(addedToFiltered[node.parent]) || !addedToFiltered[node.parent])) {
                    $scope.filteredByDepthItems.push($scope.itemsTree[node.parent].content);
                    addedToFiltered[node.parent] = true;
                  }
                  
                  node = $scope.itemsTree[node.parent];
                }
              }
            }
            
            
            $scope.filteredByDepthItems.sort(function(a, b) {
              if (a.key < b.key) {
                return -1;
              } else {
                return 1;
              }
            });
            
          
            
            $scope.displayedItems = $scope.filteredByDepthItems;
            if (!$scope.$$phase) {
              $scope.$apply()      
            }
          }, delay);
  }
  /*
   * Determines if a semdom item is completely translated
   */
  
  function isItemTranslatedCompletely(item) {
    var translated = true;
    translated = translated && (item.name.status == 0);
    translated = translated && (item.description.status == 0);
    for (var i = 0; i < item.searchKeys.length; i++) {
      translated = translated && (item.searchKeys[i].status == 0);
    }
    
    for (var i = 0; i < item.questions.length; i++) {
      translated = translated && (item.questions[i].question.status == 0);
      translated = translated && (item.questions[i].terms.status == 0);
    }
    
    return translated;
  }
  
  $scope.$watch('selectedDepth', function(newVal, oldVal) {
    if (oldVal != newVal) {
      var depth = newVal;
      $timeout(function() {
        if (depth == $scope.selectedDepth) {
            $scope.reloadItems(newVal);
        }
      }, 500);
    }
  });
  
  function checkDepth(key) {
    if ((key.length + 1) / 2 <= $scope.selectedDepth) {
      return true;
    }
    return false;
  }
  
  $scope.setTab = function(val) {
    $scope.selectedTab = val;
  }  
  
  $scope.changeTerm = function(key) {
      $scope.currentQuestionPos = 0;
      for (var i = 0; i < $scope.items.length; i++) {
        if ($scope.items[i].key == key) {
          $scope.currentEntry = $scope.items[i];
          $scope.currentEntryIndex = i;
          break;
        }
      }      
      $state.go("editor.editItem", { position: $scope.currentEntryIndex});
    }
  
  $scope.updateItem = function updateItem(v) {
    // update item if we hit the enter key
    v = (v === undefined) ? 13 : v;
    if (v == 13) {
      api.updateTerm($scope.currentEntry, function(result) {
        ;
      });
    }
  }
  
  $scope.refreshDbeData = function refreshDbeData(state) {
     return editorDataService.refreshEditorData().then(function(result) { 
       editorDataService.processEditorDto(result).then(function(resut) {
         ;
       })
     });
  };
    
  $scope.$watchCollection('items', function(newVal) {
    if (newVal && newVal.length > 0) {
      
      // reload all items up to appropriate tre depth
      var maxDepth = 0;
      for (var i in $scope.items) {
        var depth = ($scope.items[i].key.length + 1)/2;
        if (depth > maxDepth) {
          maxDepth = depth;
        }
        
        $scope.includedItems[$scope.items[i].key] = true;
      }
      
      $scope.maxDepth = maxDepth;
      $scope.reloadItems(1);
      
      // reload current entry if it is included in lsit
      if ($scope.includedItems[$scope.items[$stateParams.position].key]) {      
        $scope.currentEntry = $scope.items[$stateParams.position];
        $scope.currentEntryIndex = angular.isUndefined($stateParams.position) ? 0 : $stateParams.position;
        $scope.changeTerm($scope.currentEntry.key);
      }
      
      $scope.currentEntry = $scope.items[$scope.currentEntryIndex];
      $scope.translatedItems = {};
      // find all items that are completely translated
      for (var i = 0; i < $scope.items.length; i++) {
        if (isItemTranslatedCompletely($scope.items[i])) {
          $scope.translatedItems[$scope.items[i].key] = true;
        } else {
          $scope.translatedItems[$scope.items[i].key] = false;
        }
      }
    }   
  });
  
  $scope.$watchCollection('workingSets', function(newVal) {
    if (newVal) {
      if (angular.isUndefined($scope.selectedWorkingSet)) {
        $scope.selectedWorkingSet = 0;
      }
      else {
        loadWorkingSet($scope.workingSets[$scope.selectedWorkingSet]);
      }
    }
  });
  
  //search typeahead
  $scope.typeahead = {
    term: '',
    searchResults: []
  };
  
  
  $scope.typeahead.searchEntries = function searchEntries(query) {
    // if query starts with number, include all items whose key begin with that number
    if (!isNaN(parseInt(query[0]))) {
      $scope.typeahead.searchResults = []
      var results = [];
      var ln = query.length;
      for (var i in $scope.items) {
        if ($scope.items[i].key.substring(0, ln) === query) {
          results.push($scope.items[i]);
        }
      }
      $scope.typeahead.searchResults = results; 
    } else {
      $scope.typeahead.searchResults = $filter('filter')($scope.items, query);
    }
  };

  $scope.typeahead.searchSelect = function searchSelect(entry) {
   
  }; 
  
  function isIncluded(key) {
    return !angular.isUndefined($scope.includedItems[key]) && $scope.includedItems[key] ;
  }
  
  $scope.editWorkingSet = function editWorkingSet(wsID) {
    for (var i = 0; i < $scope.workingSets.length; i++) {
      if ($scope.workingSets[i].id == wsID) {
        $scope.selectedWorkingSet = i;
        $scope.isEditingWorkingSet = true;
        break;
      }
    }
  }
  
  $scope.cancelEditingWorkingSet = function cancelEditingWorkingSet(wsOriginal) {
    loadWorkingSet($scope.workingSets[$scope.selectedWorkingSet]);
    $scope.isEditingWorkingSet = false;
    if (!angular.isUndefined($scope.newWs)) {
      $scope.newWs = undefined;
    }
  }

  $scope.createNewWorkingSet = function createNewWorkingSet() {
    
    $scope.newWs = { id: '',  name: '', isShared : false, itemKeys : [] }
    
    for (var i = 0; i < $scope.items.length; i++) {
      $scope.newWs.itemKeys.push($scope.items[i].key);
    }
   
    $scope.isEditingWorkingSet = true;
    loadWorkingSet($scope.newWs)
  }
  
  $scope.$watch("selectedWorkingSet", function(newVal, oldVal) {
    if (oldVal != newVal) {
      loadWorkingSet($scope.workingSets[$scope.selectedWorkingSet]);
    }
  })
  
  function loadWorkingSet(ws) {
    $scope.includedItems = {};
    for (var i = 0; i < ws.itemKeys.length; i++) {
      $scope.includedItems[ws.itemKeys[i]] = true;
    }
    
    $scope.reloadItems($scope.selectedDepth);    
  }
  
  
  
  $scope.saveWorkingSet = function saveWorkingSet(ws) {
    var ik = [];
    for (var i in $scope.includedItems) {
      if ($scope.includedItems[i]) {
        ik.push(i);
      }
    }
    
    ws.itemKeys = ik;
    api.updateWorkingSet(ws, function(result) {
      if (result.ok) {
        
      }
    })
    $scope.isEditingWorkingSet = false;
    $scope.refreshDbeData();

  }
  
  $scope.isItemSelected = function isItemSelected() {
    return !angular.isUndefined($scope.currentEntryIndex);
  }
  
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
      },
      canComment: function canComment() {
        return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.CREATE);
      },
      canDeleteComment: function canDeleteComment(commentAuthorId) {
        if (sessionService.session.userId == commentAuthorId) {
          return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.DELETE_OWN);
        } else {
          return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.DELETE);
        }
      },
      canEditComment: function canEditComment(commentAuthorId) {
        if (sessionService.session.userId == commentAuthorId) {
          return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.EDIT_OWN);
        } else {
          return false;
        }
      },
      canUpdateCommentStatus: function canUpdateCommentStatus() {
        return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.EDIT);
      }
    };
}]);
