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
      controller: ['$scope', 'lexCommentService', 'sessionService', '$element', 'lexConfigService',
        function ($scope, commentService, ss, $element, lexConfig) {
        if (!angular.isDefined($scope.inputSystem)) {
          $scope.inputSystem = '';
        }

        $scope.pictureSrc = '';
        $scope.contextId = $scope.field + '_' + $scope.inputSystem;
        lexConfig.getFieldConfig($scope.field).then(function (fieldConfig) {
          if (fieldConfig.type === 'pictures' && angular.isDefined($scope.picture)) {
            $scope.pictureSrc = $scope.$parent.getPictureUrl($scope.picture);
            $scope.contextId += '_' + $scope.pictureSrc; // Would prefer to use the ID
          } else if (fieldConfig.type === 'multioptionlist') {
            $scope.contextId += '_' + $scope.multiOptionValue;
          }
        });

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
              $scope.control.commentContext.abbreviation === $scope.inputSystem &&
              $scope.control.commentContext.multiOptionValue === $scope.multiOptionValue &&
              $scope.control.commentContext.pictureSrc === $scope.pictureSrc) {
              $scope.control.hideCommentsPanel();
            } else {
              $scope.control.setCommentContext($scope.field,
                $scope.inputSystem,
                $scope.multiOptionValue,
                $scope.pictureSrc);
              $scope.control.selectFieldForComment($scope.field,
                $scope.model,
                $scope.inputSystem,
                $scope.multiOptionValue,
                $scope.pictureSrc);
              if ($scope.multiOptionValue) {
                var bubbleOffset = $scope.element.parents('.list-repeater').offset().top;
              } else {
                var bubbleOffset = $scope.element.offset().top;
              }
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
