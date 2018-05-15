'use strict';

angular.module('lexCommentsModule')
  .directive('commentBubble', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/languageforge/lexicon/editor/comment/comment-bubble.html',
      scope: {
        field: '=',
        control: '=',
        model: '=',
        parentContextGuid: '<',
        configType: '<?',
        inputSystem: '<?',
        multiOptionValue: '<?',
        picture: '<?',
        getPictureUrl: '&?'
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

            if ($scope.control.commentContext.contextGuid === $scope.contextGuid) {
              $scope.control.hideRightPanel();
            } else {
              $scope.control.setCommentContext($scope.contextGuid);
              $scope.selectFieldForComment();
              var bubbleOffset;
              if ($scope.multiOptionValue) {
                bubbleOffset = $scope.element.parents('.list-repeater').offset().top;
              } else {
                bubbleOffset = $scope.element.offset().top;
              }

              var rightPanel = angular.element('.comments-right-panel');
              var rightPanelOffsetTop = rightPanel.offset().top;
              var offsetAuthor = 40;
              rightPanel.css({ paddingTop: (bubbleOffset - rightPanelOffsetTop - offsetAuthor) });
              if ($scope.control.rightPanelVisible === false ||
                !angular.element('#lexAppCommentView').hasClass('panel-visible')) {
                $scope.control.showCommentsPanel();
              }
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
          $scope.contextGuid = $scope.parentContextGuid +
          ($scope.parentContextGuid ? ' ' : '') + $scope.field;
          lexConfig.getFieldConfig($scope.field).then(function (fieldConfig) {
            if (!angular.isDefined($scope.configType)) {
              $scope.configType = fieldConfig.type;
            }

            if (fieldConfig.type === 'pictures' && angular.isDefined($scope.picture)) {
              $scope.pictureSrc = $scope.getPictureUrl($scope.picture);
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

        $scope.isCommentingAvailable = function isCommentingAvailable() {
          return ($scope.control.currentEntry.id.indexOf('_new_') !== -1 ||
            !$scope.control.rights.canComment() ||
            ($scope.field == 'entry' && !$scope.getCount()));
        };

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
