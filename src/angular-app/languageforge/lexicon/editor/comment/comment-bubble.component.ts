import * as angular from 'angular';

import {LexiconCommentService} from '../../../../bellows/core/offline/lexicon-comments.service';
import {SessionService} from '../../../../bellows/core/session.service';
import {LexiconConfigService} from '../../core/lexicon-config.service';

export function CommentBubbleComponent() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/comment/comment-bubble.component.html',
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
    controller: ['$scope', '$element', 'lexCommentService', 'sessionService', 'lexConfigService',
    ($scope: any, $element: angular.IRootElementService, commentService: LexiconCommentService,
     sessionService: SessionService, lexConfig: LexiconConfigService) => {
      if ($scope.inputSystem == null) {
        $scope.inputSystem = {
          abbreviation: '',
          tag: ''
        };
      }

      $scope.active = false;
      $scope.pictureSrc = '';
      $scope.element = $element;

      sessionService.getSession().then(session => {
        $scope.getCount = function getCount(): number {
          if (session.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.CREATE)) {
            return commentService.getFieldCommentCount($scope.contextGuid);
          }
        };

        $scope.getCountForDisplay = function getCountForDisplay(): number | string {
          const count = $scope.getCount();
          if (count) {
            return count;
          } else {
            return '';
          }
        };

        $scope.getComments = function getComments(): void {
          if (!$scope.active) {
            return;
          }

          if ($scope.control.commentContext.contextGuid === $scope.contextGuid) {
            $scope.control.hideRightPanel();
          } else {
            $scope.control.setCommentContext($scope.contextGuid);
            $scope.selectFieldForComment();
            let bubbleOffset;
            if ($scope.multiOptionValue) {
              bubbleOffset = $scope.element.parents('.list-repeater').offset().top;
            } else {
              bubbleOffset = $scope.element.offset().top;
            }

            const rightPanel = angular.element('.comments-right-panel');
            const rightPanelOffsetTop = rightPanel.offset().top;
            const offsetAuthor = 40;
            rightPanel.css({ paddingTop: (bubbleOffset - rightPanelOffsetTop - offsetAuthor) });
            if ($scope.control.rightPanelVisible === false ||
              !angular.element('#lexAppCommentView').hasClass('panel-visible')
            ) {
              $scope.control.showCommentsPanel();
            }
          }
        };
      });

      $scope.selectFieldForComment = function selectFieldForComment(): void {
        $scope.control.selectFieldForComment($scope.field,
          $scope.model,
          $scope.inputSystem.tag,
          $scope.multiOptionValue,
          $scope.pictureSrc,
          $scope.contextGuid);
      };

      $scope.checkValidModelContextChange = function checkValidModelContextChange(): void {
        const newComment = $scope.control.getNewComment();
        if ($scope.configType === 'optionlist' &&
            newComment.regarding.field === $scope.field) {
          $scope.selectFieldForComment();
        }
      };

      $scope.setContextGuid = function setContextGuid(): void {
        $scope.contextGuid = $scope.parentContextGuid +
        ($scope.parentContextGuid ? ' ' : '') + $scope.field;
        lexConfig.getFieldConfig($scope.field).then(fieldConfig => {
          if ($scope.configType == null) {
            $scope.configType = fieldConfig.type;
          }

          if (fieldConfig.type === 'pictures' && $scope.picture != null) {
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

      $scope.isCommentingAvailable = function isCommentingAvailable(): boolean {
        return ($scope.control.currentEntry.id.indexOf('_new_') !== -1 ||
          !$scope.control.rights.canComment() ||
          ($scope.field === 'entry' && !$scope.getCount()));
      };

      $scope.$watch('model', () => {
        $scope.checkValidModelContextChange();
      }, true);

      $scope.$watch('inputSystem', () => {
        $scope.setContextGuid();
      }, true);

    }]
  };
}
