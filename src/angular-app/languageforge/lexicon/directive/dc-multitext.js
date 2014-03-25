angular.module('palaso.ui.dc.multitext', ['palaso.ui.dc.comments'])
  // Palaso UI Multitext
  .directive('dcMultitext', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-multitext.html',
			scope : {
				config : "=",
				model : "=",
				comment : "&",
				control : "="
			},
			controller: ['$scope', 'lexConfigService', function($scope, configService) {
				$scope.definitionHelperUsed = false;
				
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
				
				$scope.definitionGlossHelper = function() {
					// this is sort of a hack to mimick a feature in WeSay that automatically copies the gloss field to the definition field
					if (angular.isDefined($scope.config) && angular.isDefined($scope.config.label) && $scope.config.label == 'Meaning') {
						angular.forEach($scope.config.inputSystems, function(ws) {
							var definitionMultiText = $scope.model;
							var glossMultiText = $scope.$parent.$parent.$parent.$parent.model.gloss;
							if (angular.isDefined(definitionMultiText) && angular.isDefined(definitionMultiText[ws])) {
								if (angular.isDefined(glossMultiText) && angular.isDefined(glossMultiText[ws])) {
									if ($scope.model[ws].value == '') {
										$scope.definitionHelperUsed = true;
										$scope.model[ws].value = glossMultiText[ws].value;
									}
								}
							}
						});
						
					}
				};
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('model', function() {
					scope.makeValidModel();
					if (!scope.definitionHelperUsed) scope.definitionGlossHelper();
				});
			}
		};
  }])
  ;
