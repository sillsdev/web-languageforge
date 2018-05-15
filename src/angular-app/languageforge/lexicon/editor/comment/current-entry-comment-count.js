'use strict';

angular.module('lexCommentsModule')

  // Palaso UI Dictionary Control: Comments
  .directive('currentEntryCommentCount', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/languageforge/lexicon/editor/comment/' +
        'current-entry-comment-count.html',
      controller: ['$scope', 'lexCommentService', function ($scope, commentService) {
        $scope.count = commentService.comments.counts.currentEntry;
      }]
    };
  }])

;
