angular.module('palaso.ui.dc.rendered', [])
  // Palaso UI Rendered Definition
  .directive('dcRendered', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/common/directive/dc-rendered.html',
			scope : {
				config : "=",
				model : "=",
			},
			controller: ['$scope', function($scope) {
				$scope.definition = {
					'label': '[word goes here]',
					'rendered': '(nicely-rendered HTML goes here)'
				};
				
				$scope.render = function(definition) {
					if (definition == "Lorem ipsum") {
						$scope.definition.rendered = (
							"1) Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
							"2) Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " +
							"3) Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. " +
							"4) Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
					} else {
						$scope.definition.rendered = "Cleverly rendered definition goes here...";
					}
				}
				$scope.makeValidModel = function() {
					// if the model doesn't exist, create an object for it based upon the definition
					if (!$scope.model) {
						$scope.model = {};
						if ($scope.definition && $scope.definition.writingsystems) {
							for (var i=0; i<$scope.definition.writingsystems.length; i++) {
								$scope.model[$scope.definition.writingsystems[i]] = "";
							}
						}
					}
				};
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('model', function() {
					console.log('model watch was triggered');
					scope.makeValidModel();
					scope.render("Lorem ipsum"); // For testing
					// scope.render(model.SOME.APPROPRIATE.PROPERTIES.definition); // For production
				});
				scope.$watch('definition', function(definition) {
				})
			}
		};
  }])
  ;
