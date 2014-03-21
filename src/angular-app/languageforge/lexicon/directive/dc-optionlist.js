angular.module('palaso.ui.dc.optionlist', ['palaso.ui.dc.comments'])
  // Palaso UI Optionlist
  .directive('dcOptionlist', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-optionlist.html',
			scope : {
				config : "=",
				model : "=",
				comment : "&"
			},
			controller: ['$scope', 'lexEntryService', function($scope, lexService) {
				$scope.makeValidModel = function() {
					// if the model doesn't exist, create an object for it based upon the config
					if (!$scope.model) {
						$scope.model = {};
						if (!$scope.model.value) {
							$scope.model.value = "";
						}
					}
				};
				
				$scope.submitComment = function(comment) {
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
