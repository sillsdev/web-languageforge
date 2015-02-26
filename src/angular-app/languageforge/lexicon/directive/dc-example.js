angular.module('palaso.ui.dc.example', ['palaso.ui.dc.fieldrepeat'])
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
    controller: ['$scope', function($scope) {
    }],
    link : function(scope, element, attrs, controller) {
    }
  };
}])
;
