angular.module('palaso.ui.dc.multitext', ['lexicon.services'])
  // Palaso UI Multitext
  .directive('dcMultitext', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-multitext.html',
			scope : {
				definition : "=",
				model : "=",
			},
			controller: ['$scope', 'lexEntryService', function($scope, lexService) {
				$scope.makeValidModel = function() {
					// if the model doesn't exist, create an object for it based upon the definition
					if (!$scope.model) {
						$scope.model = {};
						if ($scope.definition && $scope.definition.inputSystems) {
							for (var i=0; i<$scope.definition.inputSystems.length; i++) {
								$scope.model[$scope.definition.inputSystems[i]] = "";
							}
						}
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
