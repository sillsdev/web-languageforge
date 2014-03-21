angular.module('palaso.ui.dc.entry', ['palaso.ui.dc.sense', 'palaso.ui.dc.multitext', 'ngAnimate'])
  // Palaso UI Dictionary Control: Entry
  .directive('dcEntry', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-entry.html',
			scope : {
				config : "=",
				model : "=",
				comment : "&"
			},
			controller: ["$scope", "$window", 'lexEntryService', function($scope, $window, lexService) {
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
						var definitionInputSystem = $scope.config.entry.fields.senses.fields.definition.inputSystems[0];
						if (sense.definition[definitionInputSystem]) {
							title = sense.definition[definitionInputSystem];
						}
					}
					return title;
				};
				
				$scope.submitComment = function(comment, field) {
					if (angular.isDefined(comment.field)) {
						comment.field = field + "_" + comment.field;
					} else {
						comment.field = field;
					}
					comment.entryId = $scope.model.id;
					$scope.comment({comment:comment});
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
