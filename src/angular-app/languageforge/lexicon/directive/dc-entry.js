angular.module('palaso.ui.dc.entry', ['palaso.ui.dc.sense', 'palaso.ui.dc.multitext', 'ngAnimate'])
  // Palaso UI Dictionary Control: Entry
  .directive('dcEntry', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-entry.html',
			scope : {
				config : "=",
				model : "="
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
					// Note: cjh 2014-03: after hours of confusion, I have concluded that there is a bug either in my code or in angularjs that will not allow me to call a method on the parent scope via the normal directive "&" passthrough method.  It is working in child directives up to this point, but it doesn't work in this directive in this case, for some reason.  I instead resort to calling $parent as a hack/workaround
					// call submitComment() on the parent, which is edit.js
					$scope.$parent.submitComment(comment);
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
