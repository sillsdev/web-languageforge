'use strict';

angular.module('palaso.ui.comments')
  .directive('commentBubble', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/palaso.ui.comments.comment-bubble.html',
      scope: {
        field: '=',
        control: '=',
        inputSystem: '='
      },
      controller: ['$scope', 'lexCommentService', 'sessionService', function ($scope, commentService, ss) {

        $scope.contextId = $scope.field + '_' + $scope.inputSystem;

        ss.getSession().then(function (session) {
          $scope.getCount = function getCount() {
            if (session.hasProjectRight(ss.domain.COMMENTS, ss.operation.CREATE)) {
              return commentService.getFieldCommentCount($scope.contextId);
            }
          };

          $scope.getCountForDisplay = function getCountForDisplay() {
            var count = $scope.getCount();
            if (count) {
              return count;
            } else {
              return '';
            }
          };

          $scope.getComments = function getComments() {
            $scope.control.setCommentContext($scope.field, $scope.inputSystem);
          };
        });

      }]
    };
  }])

;
