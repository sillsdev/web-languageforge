angular.module('palaso.ui.dc.example', ['palaso.ui.dc.multitext', 'lexicon.services'])
// Palaso UI Dictionary Control: Example Sentence
.directive('dcExample', [function() {
  return {
    restrict : 'E',
    templateUrl : '/angular-app/languageforge/lexicon/directive/dc-example.html',
    scope : {
      config : "=",
      model : "=",
      index : "=",
      remove : "=",
      control : "="
    },
    controller: ['$scope', 'lexConfigService', function($scope, lexConfigService) {
            $scope.isFieldEnabled = lexConfigService.isFieldEnabled;
            $scope.isUncommonField = lexConfigService.isUncommonField;
    }],
    link : function(scope, element, attrs, controller) {
    }
  };
}])
;
