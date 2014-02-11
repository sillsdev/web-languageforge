angular.module('palaso.ui.dc.optionlist', [])
  // Palaso UI Multitext
  .directive('dcOptionlist', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/common/directive/dc-optionlist.html',
			scope : {
				definition : "=",
				model : "=",
			},
			link : function(scope, element, attrs, controller) {

			}
		};
  }])
  ;
