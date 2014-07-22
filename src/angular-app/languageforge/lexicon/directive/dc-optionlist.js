angular.module('palaso.ui.dc.optionlist', ['palaso.ui.dc.comments'])
  // Palaso UI Optionlist
  .directive('dcOptionlist', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-optionlist.html',
			scope : {
				config : "=",
				model : "=",
				control : "="
			},
			controller: ['$scope', function($scope) {

			}],
			link : function(scope, element, attrs, controller) {
			}
		};
  }])
  ;
