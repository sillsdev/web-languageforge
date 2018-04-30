'use strict';

angular.module('palaso.ui.dc.fieldrepeat', ['editorFieldModule',
  'palaso.ui.dc.semanticdomain', 'palaso.ui.dc.example',
  'palaso.ui.dc.multiparagraph', 'palaso.ui.dc.picture'])

// Palaso UI Dictionary Control: Sense
.directive('dcFieldrepeat', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-fieldrepeat.html',
    scope: {
      config: '=',
      model: '=',
      control: '='
    },
    controller: ['$scope', '$state', 'lexConfigService',
    function ($scope, $state, lexConfigService) {
      $scope.$state = $state;
      $scope.fieldContainsData = lexConfigService.fieldContainsData;
      $scope.contextGuid = $scope.$parent.contextGuid;

      var unregister = $scope.$watch($scope.control.config, function () {
        if (angular.isDefined($scope.control.config)) {
          $scope.optionlists = $scope.control.config.optionlists;
          unregister();
        }
      });
    }]
  };
}]);
