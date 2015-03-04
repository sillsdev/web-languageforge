'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.sd.questions', 'palaso.ui.scroll'])
// DBE controller
.controller('editCtrl', ['$scope', '$stateParams', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService', '$rootScope', '$filter', '$timeout',
function($scope, $stateParams, semdomEditApi, sessionService, modal, notice, $rootScope, $filter, $timeout) {
  // refresh the data and go to state
    if ($scope.items.length == 0 && !$scope.loadingDto) {
      $scope.refreshData(true);
    } 
  $scope.maxDepth = 10;
  $scope.selectedDepth = 1;
  $scope.$parent.itemIndex = $stateParams.position;
  $scope.selectedTab = 0;
  $scope.control = $scope;
  $scope.currentQuestionPos = 0;
  $scope.tabDisplay = {"val": '0'};
  $scope.domainsFiltered = [];
  $scope.state = "edit";
  var api = semdomEditApi;
  $scope.filteredByDepthItems = [];
  $scope.displayedItems = [];
  
  $scope.reloadItems = function reloadItems(depth) {
    var depth = $scope.selectedDepth;
    $timeout(function() {
     if (depth == $scope.selectedDepth) {
        $scope.filteredByDepthItems = [];
        for (var i in $scope.items) {
          var item = $scope.items[i];
          if (checkDepth(item.key)) {
            $scope.filteredByDepthItems.push(item);
          }
          
        }
        $scope.displayedItems = $scope.filteredByDepthItems.slice(0, 25);
        $scope.$apply() 
     }
    }, 500);
    
  }
  
  $scope.loadMore = function loadMore() {
    var mx = $scope.filteredByDepthItems.length;
    if ($scope.displayedItems.length + 25 < mx) {
      mx = $scope.displayedItems.length + 25;
    }
    
    for (var i = $scope.displayedItems.length; i < mx; i++) {
      $scope.displayedItems.push($scope.filteredByDepthItems[i]);
    }
  }
  
  $scope.$watch('selectedDepth', function(oldVal, newVal) {
    if (oldVal != newVal) {
      $scope.reloadItems(newVal);
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
          break;
        }
      }      
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
