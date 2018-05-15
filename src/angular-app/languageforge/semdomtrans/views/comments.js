'use strict';

angular.module('semdomtrans.comments', ['ui.bootstrap', 'coreModule',
  'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term',
  'palaso.ui.scroll', 'lexCommentsModule', 'semdomtransCommentsViewModule'])

// DBE controller
.controller('commentsCtrl', ['$scope', 'semdomtransEditorDataService', '$stateParams',
  'silNoticeService', 'lexCommentService',
function ($scope, editorService, $stateParams,
          notice, commentService) {
  $scope.control = $scope;
  $scope.currentEntryIndex = $stateParams.position;
  $scope.editorService = editorService;
  $scope.comments = commentService.comments.items.all;
  $scope.currentQuestionPos = 0;
  $scope.loadEntryComments = function loadEntryComments() {
    commentService.loadEntryComments($scope.items[$stateParams.position].id);
  };

  $scope.refreshDbeData = function refreshDbeData() {
    return editorService.refreshEditorData();
  };

  $scope.$watchCollection('items', function (newVal) {
    if (newVal) {
      $scope.currentEntry = $scope.items[$stateParams.position];
    }
  });

  $scope.$watchCollection('comments', function (oldVal, newVal) {
    if (oldVal !== newVal) {
      $scope.loadEntryComments();
    }
  });

  $scope.getMeaningForDisplay = function getMeaningForDisplay() {
    return undefined;
  };

  $scope.getWordForDisplay = function getWordForDisplay() {
    return undefined;
  };
}]);
