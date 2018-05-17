import * as angular from 'angular';

import {SessionService} from '../../../../bellows/core/session.service';
import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexField} from '../../shared/model/lex-field.model';
import {LexMultiValue} from '../../shared/model/lex-multi-value.model';
import {LexValue} from '../../shared/model/lex-value.model';

export function LexCommentsViewComponent() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/comment/lex-comments-view.component.html',
    scope: {
      entry: '=',
      entryConfig: '=',
      control: '='
    },
    controller: ['$scope', '$q', 'sessionService', 'lexConfigService',
    ($scope: any, $q: angular.IQService, sessionService: SessionService, lexConfig: LexiconConfigService) => {
      // notes by cjh 2015-03
      // define this method on the control (which happens to be an ancestor scope) because it is
      // used by a sibling directive (dc-entry)
      // an alternative implementation to this would be to use the commentService to contain this
      // method (but then the comment service would become lex specific which is a downside
      $q.all([lexConfig.refresh(), sessionService.getSession()]).then(([config, session]) => {
        $scope.config = config;
        $scope.control.selectFieldForComment =
        function selectFieldForComment(fieldName: string, model: LexField, inputSystemTag: string,
                                       multioptionValue: string, pictureFilePath: string, contextGuid: string): void {
          const canComment = session.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.CREATE);
          if (!canComment) return;

          lexConfig.getFieldConfig(fieldName).then(fieldConfig => {
            $scope.newComment.regardingFieldConfig = fieldConfig;
            $scope.newComment.regarding.field = fieldName;
            $scope.newComment.regarding.fieldNameForDisplay =
              $scope.newComment.regardingFieldConfig.label;
            delete $scope.newComment.regarding.inputSystem;
            delete $scope.newComment.regarding.inputSystemAbbreviation;
            $scope.newComment.isRegardingPicture = false;
            $scope.newComment.contextGuid = contextGuid;
            if (inputSystemTag) {
              $scope.newComment.regarding.fieldValue = getFieldValue(model, inputSystemTag);
              $scope.newComment.regarding.inputSystem =
                $scope.config.inputSystems[inputSystemTag].languageName;
              $scope.newComment.regarding.inputSystemAbbreviation =
                $scope.config.inputSystems[inputSystemTag].abbreviation;
            } else if (multioptionValue) {
              $scope.newComment.regarding.fieldValue = multioptionValue;
            } else if (pictureFilePath) {
              $scope.newComment.regarding.fieldValue = pictureFilePath;
              $scope.newComment.isRegardingPicture = true;
            } else {
              $scope.newComment.regarding.fieldValue = getFieldValue(model);
            }
          });
        };
      });

      $scope.control.getNewComment = function getNewComment() {
        return $scope.newComment;
      };

      function getFieldValue(model: LexField, inputSystem?: string): string {
        // get value of option list
        if ((model as LexValue).value != null) {

          // todo return display value
          return (model as LexValue).value;
        }

        // get value of multi-option list
        if ((model as LexMultiValue).values != null) {

          // todo return display values
          return (model as LexMultiValue).values.join(' ');
        }

        // get value of multi-text with specified inputSystem
        if (inputSystem != null && model[inputSystem] != null) {
          return model[inputSystem].value;
        }

        // get first inputSystem of a multi-text (no inputSystem specified)
        let valueToReturn: string = null;
        angular.forEach(model, prop => {
          if (valueToReturn == null) {
            valueToReturn = prop.value;
            return;
          }
        });

        return valueToReturn;
      }

    }]
  };
}
