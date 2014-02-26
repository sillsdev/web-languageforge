
angular.module('palaso.ui.language', [])
 // Palaso UI Select Language: button dropdown 
.directive('puiSelectLanguageDrop', [function() {
	return {
		restrict : 'E',
		transclude: true,
		templateUrl : '/angular-app/bellows/directive/pui-language.html',
		scope : {
			puiBtnType : "=",
		},
		controller: ["$scope", function($scope) {
			$scope.puiBtnClass = "btn btn-success dropdown-toggle";
		}],
		link : function(scope, element, attrs, controller) {
		}
	};
}])
;
