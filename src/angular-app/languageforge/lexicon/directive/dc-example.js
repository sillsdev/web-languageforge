angular.module('palaso.ui.dc.example', ['palaso.ui.dc.multitext'])
  // Palaso UI Dictionary Control: Example Sentence
  .directive('dcExample', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-example.html',
			scope : {
				config : "=",
				model : "=",
				index : "=",
				remove : "=",
				comment : "&",
				control : "="
			},
			controller: ['$scope', function($scope) {
				$scope.makeValidModel = function() {
					if (!$scope.model) {
						$scope.model = {};
					}
				};
				
				$scope.submitComment = function(comment, field) {
					if (angular.isDefined(field)) {
						comment.field = field;
					}
					comment.exampleId = $scope.model.id;
					$scope.comment({comment: comment});
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
