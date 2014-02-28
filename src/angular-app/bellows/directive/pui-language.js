
angular.module('palaso.ui.language', [])
 // Palaso UI Select Language 
.directive('puiSelectLanguage', [function() {
	return {
		restrict : 'E',
		transclude: true,
		templateUrl : '/angular-app/bellows/directive/pui-language.html',
		scope : {
			puiCode : "=",
			puiLanguage : "=",
			puiAddDisabled : "=",
		},
		controller: ["$scope", '$filter', function($scope, $filter) {
			$scope.languages = inputSystems.languages('debug');

			$scope.currentCode = '';
			$scope.puiAddDisabled = true;
			$scope.selectLanguage = function(language) {
				$scope.currentCode = language.code.three;
				$scope.puiCode = (language.code.two) ? language.code.two : language.code.three;
				$scope.puiLanguage = language;
				$scope.puiAddDisabled = false;
			};
		}]
	};
}])
;
