"use strict";

angular.module('palaso.ui.dc.fieldrepeat', ['palaso.ui.dc.multitext', 'palaso.ui.dc.optionlist', 'palaso.ui.dc.multioptionlist', 'palaso.ui.dc.example', 'palaso.ui.dc.picture', 'palaso.ui.comments', 'bellows.services', 'lexicon.services'])
// Palaso UI Dictionary Control: Sense
.directive('dcFieldrepeat', [function() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-fieldrepeat.html',
    scope: {
      config: "=",
      model: "=",
      control: "="
    },
    controller: ['$scope', 'lexConfigService', function($scope, lexConfigService) {
      $scope.fieldContainsData = lexConfigService.fieldContainsData;

    }],
    link: function(scope, element, attrs, controller) {
      scope.optionlists = scope.control.config.optionlists;

    }
  };
}]);
