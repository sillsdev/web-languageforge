angular.module('palaso.ui.dc.multioptionlist', ['palaso.ui.dc.comments'])
  // Palaso UI Optionlist
  .directive('dcMultioptionlist', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-multioptionlist.html',
			scope : {
				config : "=",
				model : "=",
			},
			controller: ['$scope', 'lexEntryService', function($scope, lexService) {
				$scope.makeValidModel = function() {
					// if the model doesn't exist, create an object for it based upon the config
					if (!$scope.model) {
						$scope.model = {};
						if (!$scope.model.values) {
							$scope.model.values = [];
						}
					}
				};
				
				$scope.getDisplayName = function(value) {
					return value;
				};
				
				$scope.addValue = function() {
					if (angular.isDefined($scope.newValue)) {
						$scope.model.values.push($scope.newValue);
					}
				};

				$scope.getAbbreviation = function(inputSystem) {
					return lexService.getConfig().inputSystems[inputSystem].abbreviation;
				};
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('model', function() {
					scope.makeValidModel();
				});
			}
		};
  }])
  ;
