
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
			puiShowLinks : "=",
		},
		controller: ['$scope', '$filter', function($scope, $filter) {
			// TODO Enhance. Could use infinite scrolling since search can return large results. See example here http://jsfiddle.net/W6wJ2/. IJH 2014-02
			
			$scope.languages = InputSystems.languages();
			
			$scope.filterText = 'xXxXxXxXxXxDoesntExistxXxXxXxXxXx';
			$scope.search = function() {
				$scope.filterText = $scope.searchText;
				if ($scope.searchText == '*') {
					$scope.filterText = '';
				}
			};
			$scope.clearSearch = function() {
				$scope.searchText = '';
				$scope.filterText = 'xXxXxXxXxXxDoesntExistxXxXxXxXxXx';
			};

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
