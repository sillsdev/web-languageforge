angular.module('palaso.ui.dc.optionlist', [])
  // Palaso UI Optionlist
  .directive('dcOptionlist', [function() {
    return {
      restrict : 'E',
      templateUrl : '/angular-app/languageforge/lexicon/directive/dc-optionlist.html',
      scope : {
        config : "=",
        model : "=",
        control : "=",
                items : "="
      },
      controller: ['$scope', function($scope) {

      }],
      link : function(scope, element, attrs, controller) {
      }
    };
  }])
  ;
