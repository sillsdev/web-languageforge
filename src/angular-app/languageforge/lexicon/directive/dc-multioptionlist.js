angular.module('palaso.ui.dc.multioptionlist', [])
  // Palaso UI Optionlist
  .directive('dcMultioptionlist', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-multioptionlist.html',
			scope : {
				config : "=",
				model : "=",
				control: "=",
                items: "="
			},
			controller: ['$scope', function($scope) {
				$scope.getDisplayName = function(value) {
                    var displayName = value;
                    for (var i=0; i< $scope.items.length; i++) {
                        if ($scope.items[i].key == value) {
                            displayName = $scope.items[i].value;
                            break;
                        }
                    }
					return displayName;
				};
				
				$scope.addValue = function() {
					if (angular.isDefined($scope.newValue)) {
						$scope.model.values.push($scope.newValue);
					}
				};

			}],
			link : function(scope, element, attrs, controller) {
			}
		};
  }])
  ;
