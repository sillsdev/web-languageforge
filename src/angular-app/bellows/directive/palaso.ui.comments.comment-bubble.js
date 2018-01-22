'use strict';

angular.module('palaso.ui.comments')
  .directive('commentBubble', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/palaso.ui.comments.comment-bubble.html',
      scope: {
        field: '=',
        control: '=',
        inputSystem: '<',
        model: '=',
        configType: '<',
        multiOptionValue: '<',
        picture: '<'
      },
      controller: ['$scope', 'lexCommentService', 'sessionService', '$element',
        function ($scope, commentService, ss, $element) {
        if (!angular.isDefined($scope.inputSystem)) {
          $scope.inputSystem = '';
        }

        $scope.pictureSrc = '';
        if (angular.isDefined($scope.configType) && $scope.configType === 'picture') {
          $scope.contextId = $scope.field + '_' + $scope.picture.guid;
          $scope.pictureSrc = $scope.picture.filename;
        } else {
          $scope.contextId = $scope.field + '_' + $scope.inputSystem;
        }

        $scope.element = $element;

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
            if (!angular.isDefined($scope.inputSystem)) {
              $scope.inputSystem = '';
            }

            if ($scope.control.commentContext.field === $scope.field &&
              $scope.control.commentContext.abbreviation === $scope.inputSystem) {
              $scope.control.hideCommentsPanel();
            } else {
              $scope.control.setCommentContext($scope.field, $scope.inputSystem);
              $scope.control.selectFieldForComment($scope.field,
                $scope.model,
                $scope.inputSystem,
                $scope.multiOptionValue,
                $scope.pictureSrc);
              var bubbleOffset = $scope.element.offset().top;
              var rightPanel = angular.element('.comments-right-panel');
              var rightPanelOffset = rightPanel.offset().top;
              var offsetAuthor = 40;
              rightPanel.css({ paddingTop: (bubbleOffset - rightPanelOffset - offsetAuthor) });
              $scope.control.showCommentsPanel();
            }
          };
        });

      }]
    };
  }])

;
