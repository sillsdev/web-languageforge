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
          $scope.inputSystem = {
            abbreviation: '',
            tag: ''
          };
        }

        $scope.active = false;
        $scope.pictureSrc = '';
        $scope.element = $element;

        ss.getSession().then(function (session) {
          $scope.getCount = function getCount() {
            if (session.hasProjectRight(ss.domain.COMMENTS, ss.operation.CREATE)) {
              return commentService.getFieldCommentCount($scope.contextGuid);
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
            if (!$scope.active) {
              return;
            }

            // Make sure there is an entry ID as you can't comment on a new entry until it is saved
            if ($scope.control.currentEntry.id.indexOf('_new_') !== -1) {
              $scope.control.saveCurrentEntry(true, function () {
                // Need to also check against this promise as the callback above doesn't include it
                $scope.control.editorService.refreshEditorData().then(function () {
                  $scope.getComments();
                });
              });

              return false;
            }

            if ($scope.control.commentContext.contextGuid === $scope.contextGuid) {
              $scope.control.hideCommentsPanel();
            } else {
              $scope.control.setCommentContext($scope.contextGuid);
              $scope.selectFieldForComment();
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

        $scope.selectFieldForComment = function selectFieldForComment() {
          $scope.control.selectFieldForComment($scope.field,
            $scope.model,
            $scope.inputSystem.tag,
            $scope.multiOptionValue,
            $scope.pictureSrc,
            $scope.contextGuid);
        };

        $scope.checkValidModelContextChange = function checkValidModelContextChange() {
          var newComment = $scope.control.getNewComment();
          if ($scope.configType === 'optionlist' &&
              newComment.regarding.field === $scope.field) {
            $scope.selectFieldForComment();
          }
        };

        $scope.setContextGuid = function setContextGuid() {
          $scope.contextGuid = $scope.$parent.contextGuid +
          ($scope.$parent.contextGuid ? ' ' : '') + $scope.field;
          lexConfig.getFieldConfig($scope.field).then(function (fieldConfig) {
            if (!angular.isDefined($scope.configType)) {
              $scope.configType = fieldConfig.type;
            }

            if (fieldConfig.type === 'pictures' && angular.isDefined($scope.picture)) {
              $scope.pictureSrc = $scope.$parent.getPictureUrl($scope.picture);
              $scope.contextGuid += '#' + $scope.picture.guid; // Would prefer to use the ID
            } else if (fieldConfig.type === 'multioptionlist') {
              $scope.contextGuid += '#' + $scope.multiOptionValue;
            }

            $scope.contextGuid += ($scope.inputSystem.abbreviation ? '.' +
              $scope.inputSystem.abbreviation : '');
            if ($scope.contextGuid.indexOf('undefined')  === -1) {
              $scope.active = true;
            }
          });
        };

        $scope.setContextGuid();

        $scope.$watch('model', function () {
          $scope.checkValidModelContextChange();
        }, true);

        $scope.$watch('inputSystem', function () {
          $scope.setContextGuid();
        }, true);

      }]
    };
  }])

;
