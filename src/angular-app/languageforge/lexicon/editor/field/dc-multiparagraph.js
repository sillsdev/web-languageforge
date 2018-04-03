'use strict';

angular.module('palaso.ui.dc.multiparagraph', ['coreModule', 'editorFieldModule'])

// Dictionary Control Multitext
.directive('dcMultiparagraph', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-multiparagraph.html',
    scope: {
      config: '=',
      model: '=',
      control: '=',
      selectField: '&',
      fieldName: '='
    },
    controller: ['$scope', '$state', 'sessionService', function ($scope, $state, sessionService) {
      $scope.$state = $state;
      $scope.contextGuid = $scope.$parent.contextGuid;

      sessionService.getSession().then(function (session) {
        $scope.inputSystems = session.projectSettings().config.inputSystems;

        $scope.inputSystemDirection = function inputSystemDirection(tag) {
          if (!(tag in $scope.inputSystems)) {
            return 'ltr';
          }

          return ($scope.inputSystems[tag].isRightToLeft) ? 'rtl' : 'ltr';
        };
      });

      $scope.modelContainsSpan = function modelContainsSpan() {
        if (angular.isUndefined($scope.model)) {
          return false;
        }

        return $scope.model.paragraphsHtml.indexOf('</span>') > -1;
      };

    }]
  };
}]);
