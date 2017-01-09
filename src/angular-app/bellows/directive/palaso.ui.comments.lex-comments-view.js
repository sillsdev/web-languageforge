'use strict';
angular.module('palaso.ui.comments')

// Palaso UI Dictionary Control: Comments

  .directive('lexCommentsView', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/palaso.ui.comments.lex-comments-view.html',
      scope: {
        entry: '=',
        entryConfig: '=',
        control: '='
      },
      controller: ['$scope', '$filter', 'lexCommentService', 'sessionService', 'modalService',
        'lexConfigService',
      function ($scope, $filter, commentService, sessionService, modal, lexConfig) {
        lexConfig.refresh();
        $scope.config = lexConfig.configForUser;

        function canComment() {
          return sessionService.hasProjectRight(sessionService.domain.COMMENTS,
            sessionService.operation.CREATE);
        }

        // notes by cjh 2015-03
        // define this method on the control (which happens to be an ancestor scope) because it is
        // used by a sibling directive (dc-entry)
        // an alternative implementation to this would be to use the commentService to contain this
        // method (but then the comment service would become lex specific which is a downside
        $scope.control.selectFieldForComment =
        function selectFieldForComment(fieldName, model, inputSystem, multioptionValue,
                                       pictureFilePath) {
          if (canComment()) {
            $scope.newComment.regardingFieldConfig = lexConfig.getFieldConfig(fieldName);
            $scope.newComment.regarding.field = fieldName;
            $scope.newComment.regarding.fieldNameForDisplay =
              $scope.newComment.regardingFieldConfig.label;
            delete $scope.newComment.regarding.inputSystem;
            delete $scope.newComment.regarding.inputSystemAbbreviation;
            $scope.newComment.isRegardingPicture = false;
            if (inputSystem) {
              $scope.newComment.regarding.fieldValue = getFieldValue(model, inputSystem);
              $scope.newComment.regarding.inputSystem =
                $scope.config.inputSystems[inputSystem].languageName;
              $scope.newComment.regarding.inputSystemAbbreviation =
                $scope.config.inputSystems[inputSystem].abbreviation;
            } else if (multioptionValue) {
              $scope.newComment.regarding.fieldValue = multioptionValue;
            } else if (pictureFilePath) {
              $scope.newComment.regarding.fieldValue = pictureFilePath;
              $scope.newComment.isRegardingPicture = true;
            } else {
              $scope.newComment.regarding.fieldValue = getFieldValue(model);
            }
          }
        };

        function getFieldValue(model, inputSystem) {

          // get value of option list
          if (angular.isDefined(model.value)) {

            // todo return display value
            return model.value;
          }

          // get value of multi-option list
          if (angular.isDefined(model.values)) {

            // todo return display values
            return model.values.join(' ');
          }

          // get value of multi-text with specified inputSystem
          if (angular.isDefined(inputSystem) && angular.isDefined(model[inputSystem])) {
            return model[inputSystem].value;
          }

          // get first inputSystem of a multi-text (no inputSystem specified)
          var valueToReturn = undefined;
          angular.forEach(model, function (prop) {
            if (angular.isUndefined(valueToReturn)) {
              valueToReturn = prop.value;
              return valueToReturn;
            }
          });

          return valueToReturn;
        }

      }],

      link: function (scope, element, attrs, controller) {
      }
    };
  }])

;
