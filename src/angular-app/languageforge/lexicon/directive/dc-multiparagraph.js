'use strict';

angular.module('palaso.ui.dc.multiparagraph', ['bellows.services', 'palaso.ui.showOverflow',
  'palaso.ui.dc.formattedtext'])

// Dictionary Control Multitext
.directive('dcMultiparagraph', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-multiparagraph.html',
    scope: {
      config: '=',
      model: '=',
      control: '=',
      selectField: '&'
    },
    controller: ['$scope', '$state', 'sessionService', function ($scope, $state, sessionService) {
      $scope.$state = $state;
      $scope.inputSystems = sessionService.session.projectSettings.config.inputSystems;

      $scope.inputSystemDirection = function inputSystemDirection(tag) {
        if (!(tag in $scope.inputSystems)) {
          return 'ltr';
        }

        return ($scope.inputSystems[tag].isRightToLeft) ? 'rtl' : 'ltr';
      };

      $scope.modelContainsSpan = function modelContainsSpan() {
        if (angular.isUndefined($scope.model)) {
          return false;
        }

        return $scope.model.paragraphsHtml.indexOf('</span>') > -1;
      };

    }]
  };
}]);
