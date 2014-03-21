angular.module('palaso.ui.dc.multitext', ['palaso.ui.dc.comments'])
  // Palaso UI Multitext
  .directive('dcMultitext', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-multitext.html',
			scope : {
				config : "=",
				model : "=",
				comment : "&"
			},
			controller: ['$scope', 'lexConfigService', function($scope, configService) {
				
				configService.registerListener(function() {
					$scope.gConfig = configService.getConfig();
				});
				$scope.makeValidModel = function() {
					// if the model doesn't exist, create an object for it based upon the config
					if (!$scope.model) {
						$scope.model = {};
						if ($scope.config && $scope.config.inputSystems) {
							for (var i=0; i<$scope.config.inputSystems.length; i++) {
								$scope.model[$scope.config.inputSystems[i]] = {value: ""};
							}
						}
					}
				};
				
				$scope.submitComment = function(comment, inputSystem) {
					comment.inputSystem = inputSystem;
					$scope.comment({comment:comment});
				};
				
				$scope.getAbbreviation = function(inputSystem) {
					if (angular.isDefined($scope.gConfig)) {
						return $scope.gConfig.inputSystems[inputSystem].abbreviation;
					}
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
