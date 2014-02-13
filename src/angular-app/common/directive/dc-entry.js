angular.module('palaso.ui.dc.entry', ['palaso.ui.dc.sense', 'palaso.ui.dc.multitext', 'ngAnimate'])
  // Palaso UI Dictionary Control: Entry
  .directive('dcEntry', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/common/directive/dc-entry.html',
			scope : {
				config : "=",
				model : "=",
			},
			controller: ["$scope", "$window", function($scope, $window) {
				$scope.addSense = function() {
					$scope.model.senses.unshift({});
				};
				
				$scope.makeValidModel = function() {
					if (!$scope.model) {
						$scope.model = {};
					}
					/*
					if (!$scope.model.id) {
						$scope.model.id = 0;
					}
					*/
					if (!$scope.model.senses) {
						$scope.model.senses = [{}];
					}
				};
				
				$scope.deleteSense = function(index) {
					if ($window.confirm("Are you sure you want to delete sense #" + (index+1) + " ?")) {
						$scope.model.senses.splice(index, 1);
					}
				};
				
				$scope.getSenseTitle = function(sense) {
					var title = "[new meaning]";
					if (sense && sense.definition && $scope.config.entry) {
						var definitionWritingSystem = $scope.config.entry.fields.senses.fields.definition.writingsystems[0];
						if (sense.definition[definitionWritingSystem]) {
							title = sense.definition[definitionWritingSystem];
						}
					}
					return title;
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
