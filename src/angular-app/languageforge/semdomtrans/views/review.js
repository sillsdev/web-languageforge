'use strict';

angular.module('semdomtrans.review', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.fieldReview', 'palaso.ui.scroll', 'palaso.ui.typeahead'])
// DBE controller
.controller('reviewCtrl', ['$scope', '$state', '$stateParams', 'semdomtransEditorDataService', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService', '$rootScope', '$filter', '$timeout',
function($scope, $state, $stateParams, editorService, semdomEditApi, sessionService, modal, notice, $rootScope, $filter, $timeout) {
    $scope.control = $scope;
    if ($scope.displayedItems == undefined) {
      editorService.refreshEditorData().then(function(result) {
        calculateDisplayedItems();
      });      
    }
    
    $scope.refreshDbeData = function refreshDbeData(state) {
      return editorService.refreshEditorData().then(function (result) {
        calculateDisplayedItems();
      })
    };
    
    function calculateDisplayedItems() {
      $scope.displayedItems = [];
      
      var isCurrentEntryStillInList = false;
      for (var i in $scope.items) {
        if(doesItemNeedReview($scope.items[i])) {
          $scope.displayedItems.push($scope.items[i]);
          if ($scope.currentEntry != undefined && $scope.currentEntry.id == $scope.items[i].id) {
            isCurrentEntryStillInList = true;
          }
        }
      }
      
      if (!isCurrentEntryStillInList) {
        $scope.currentEntry = undefined;
      }
      
    }
    
    function doesItemNeedReview(item) {     
        var nr = false;
        nr = nr || doesFieldNeedReview(item.name);
        nr = nr || doesFieldNeedReview(item.description);
        for (var i = 0; i < item.searchKeys.length; i++) {
          nr =  nr || doesFieldNeedReview(item.searchKeys[i]);
        }
        
        for (var i = 0; i < item.questions.length; i++) {
          nr =  nr || doesFieldNeedReview(item.questions[i].question);
          nr =  nr || doesFieldNeedReview(item.questions[i].terms);
        }
        
        return nr;
    }
    
    $scope.changeTerm = function changeTerm(key) {
      for (var i = 0; i < $scope.items.length; i++) {
        if ($scope.items[i].key == key) {
          $scope.currentEntry = $scope.items[i];
          $scope.currentEntryIndex = i;
          break;
        }
      }
    }
    
    $scope.$watch("currentEntry", function (newVal, oldVal) {
      if (newVal != oldVal) {
        var fieldsForReview = {};
        if (!angular.isUndefined($scope.currentEntry)) {
          if (doesFieldNeedReview($scope.currentEntry.name)) {
            fieldsForReview["Name"] = $scope.currentEntry.name;
          };
          
          if (doesFieldNeedReview($scope.currentEntry.description)) {
            fieldsForReview["Description"] = $scope.currentEntry.description;
          }
          
          for (var i = 0; i < $scope.currentEntry.searchKeys.length; i++) {
            if (doesFieldNeedReview($scope.currentEntry.searchKeys[i])) {
              fieldsForReview["Search Key " + i] = $scope.currentEntry.searchKeys[i];
            }
          }
          
          for (var i = 0; i < $scope.currentEntry.questions.length; i++) {
            if (doesFieldNeedReview($scope.currentEntry.questions[i].question)) {
              fieldsForReview["Question " + i] = $scope.currentEntry.questions[i].question;
            }
            if (doesFieldNeedReview($scope.currentEntry.questions[i].terms)) {
              fieldsForReview["Question Terms " + i] = $scope.currentEntry.questions[i].terms;
            }
          }
        }
        
        $scope.fieldsForReview = fieldsForReview;
      }
    });
    function doesFieldNeedReview(field) {
      return field.translation != '' && field.status == 1;
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
