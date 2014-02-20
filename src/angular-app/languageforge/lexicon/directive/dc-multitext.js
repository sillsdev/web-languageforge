angular.module('palaso.ui.dc.multitext', [])
  // Palaso UI Multitext
  .directive('dcMultitext', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/common/directive/dc-multitext.html',
			scope : {
				definition : "=",
				model : "=",
			},
			controller: ['$scope', function($scope) {
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
					scope.makeValidModel();
				});
			}
		};
  }])
  ;
