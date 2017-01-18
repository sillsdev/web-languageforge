"use strict";
angular.module('palaso.ui.comments')
  .directive('commentBubble', [function() {
    return {
      restrict : 'E',
      templateUrl : '/angular-app/bellows/directive/' + bootstrapVersion + '/palaso.ui.comments.comment-bubble.html',
      scope : {
        field : "=",
        control : "="
      },
      controller: ['$scope', 'lexCommentService', 'sessionService', function($scope, commentService, sessionService) {

        $scope.getCount = function getCount() {
          if (sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.CREATE)) {
            return commentService.getFieldCommentCount($scope.field);
          }
        };

        $scope.getCountForDisplay = function getCountForDisplay() {
          var count = $scope.getCount();
          if (count) {
            if (count < 10) {
              return ' ' + count;
            } else {
              return count;
            }
          } else {
            return '';
          }
        };

      }],
      link : function(scope, element, attrs, controller) {
      }
    };
  }])
;
