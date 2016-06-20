'use strict';

angular.module('semdomtrans.comments', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'bellows.services.comments', 'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.scroll', 'palaso.ui.comments'])
// DBE controller
.controller('commentsCtrl', ['$scope', 'semdomtransEditorDataService', '$stateParams', 'sessionService', 'modalService', 'silNoticeService', 'lexCommentService',
function($scope, editorService, $stateParams, sessionService, modal, notice, commentService) {
  $scope.control = $scope;
  $scope.currentEntryIndex = $stateParams.position;
  $scope.editorService = editorService;
  $scope.comments = commentService.comments.items.all;
  $scope.currentQuestionPos = 0;
   $scope.loadEntryComments = function loadEntryComments() {
      commentService.loadEntryComments($scope.items[$stateParams.position].id);
   }
   
    $scope.refreshDbeData = function refreshDbeData() {
     return editorService.refreshEditorData();
    }
    
    $scope.$watchCollection('items', function(newVal) {
      if (newVal) {
          $scope.currentEntry = $scope.items[$stateParams.position];
      }
    })
    $scope.$watchCollection('comments', function(oldVal, newVal) {
      if (oldVal != newVal) {      
          $scope.loadEntryComments();
      }
    });
    $scope.getMeaningForDisplay = function(entry) {
      return undefined;
    }
    $scope.getWordForDisplay = function(entry) {
      return undefined;
    }
}]);
