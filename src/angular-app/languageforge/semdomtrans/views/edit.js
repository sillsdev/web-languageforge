'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.sd.questions', 'palaso.ui.scroll', 'palaso.ui.typeahead'])
// DBE controller
.controller('editCtrl', ['$scope', '$state', '$stateParams', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService', '$rootScope', '$filter', '$timeout',
function($scope, $state, $stateParams, semdomEditApi, sessionService, modal, notice, $rootScope, $filter, $timeout) {
  // refresh the data and go to state
  if ($scope.items.length == 0 && !$scope.loadingDto) {
      $scope.refreshData(true);
  }
  $scope.maxDepth = 10;
  $scope.selectedTab = 0;
  $scope.control = $scope;
  $scope.currentQuestionPos = 0;
  $scope.tabDisplay = {"val": '0'};
  $scope.state = "edit";
  $scope.filteredByDepthItems = [];
  $scope.filteredByDepthItemsDict = {};
  $scope.displayedItems = [];
  $scope.selectedDepth = 1;
  var api = semdomEditApi;
  
  $scope.reloadItems = function reloadItems(depth) {   
      $scope.filteredByDepthItems = [];
      var addedToFiltered = {};
      for (var i in $scope.itemsTree) {
        var node = $scope.itemsTree[i];
        var item = node.content;
        if (isIncluded(item.key)) {
          if (checkDepth(item.key)) {
            $scope.filteredByDepthItems.push(item);
            addedToFiltered[item.key] = true;
          }
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
      
      $scope.displayedItems = $scope.filteredByDepthItems.slice(0, 50);
      if (!$scope.$$phase) {
        $scope.$apply()      
      }
  }
  
  $scope.loadMore = function loadMore() {
    var mx = $scope.filteredByDepthItems.length;
    if ($scope.displayedItems.length + 50 < mx) {
      mx = $scope.displayedItems.length + 50;
    }
    
    for (var i = $scope.displayedItems.length; i < mx; i++) {
      $scope.displayedItems.push($scope.filteredByDepthItems[i]);
    }
  }
  
  $scope.$watch('items', function(newVal, oldVal) {
    if (oldVal != newVal) {      
        $scope.currentEntry = $scope.items[$scope.currentEntryIndex];
    }
  });
  
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
    v = (v === undefined) ? 13 : v;
    if (v == 13) {
      api.updateTerm($scope.currentEntry, function(result) {
        ;
      });
    }
  }
  
  $scope.refreshData = function refreshData(state) {
      $scope.$parent.refreshData(state, function() { });
  };
    
  $scope.$watch('items', function(oldVal, newVal) {
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
    if ($scope.includedItems[$scope.items[$scope.currentEntryIndex].key]) {      
      $scope.currentEntry = $scope.items[$scope.currentEntryIndex];
      $scope.currentEntryIndex = angular.isUndefined($stateParams.position) ? 0 : $stateParams.position;
    }
    
    
  });
  
//search typeahead
  $scope.typeahead = {
    term: '',
    searchResults: []
  };
  $scope.typeahead.searchEntries = function searchEntries(query) {
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
  
  $scope.setInclusion = function includeAll(itemsToInclude, v) {
    for (var i in itemsToInclude) {
      $scope.includedItems[itemsToInclude[i].key] = v;
    }
    
    $scope.reloadItems($scope.selectedDepth);    
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
