'use strict';

angular.module('palaso.ui.dc.multitext', ['bellows.services', 'palaso.ui.showOverflow', 'palaso.ui.dc.formattedtext'])

// Dictionary Control Multitext
.directive('dcMultitext', [function() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-multitext.html',
    scope: {
      config: "=",
      model: "=",
      control: "=",
      selectField: "&"
    },
    controller: ['$scope', 'sessionService', function($scope, ss) {
      $scope.inputSystems = ss.session.projectSettings.config.inputSystems;

      $scope.inputSystemDirection = function inputSystemDirection(tag) {
        if (!(tag in $scope.inputSystems)) {
          return 'ltr';
        }
        return ($scope.inputSystems[tag].isRightToLeft) ? 'rtl' : 'ltr';
      };

      $scope.selectInputSystem = function selectInputSystem(tag) {
        $scope.selectField({
          inputSystem: tag
        });
      };
                
      $scope.modelContainsSpan = function modelContainsSpan(tag) {
        if (angular.isUndefined($scope.model) || ! (tag in $scope.model)) {
          return false;
        }
        return $scope.model[tag].value.indexOf('</span>') > -1;
      };

    }]
  };
}]);
