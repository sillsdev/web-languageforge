angular.module('palaso.ui.dc.multioptionlist', [])
  // Palaso UI Optionlist
  .directive('dcMultioptionlist', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-multioptionlist.html',
			scope : {
				config : "=",
				model : "=",
				control: "="
			},
			controller: ['$scope', function($scope) {
				$scope.getDisplayName = function(value) {
                    var displayName = value;
                    var optionlist = $scope.control.config.optionlists[$scope.config.listCode];
                    if (angular.isDefined(optionlist)) {
                        for (var i=0; i< optionlist.items.length; i++) {
                            if (optionlist.items[i].key == value) {
                                displayName = optionlist.items[i].value;
                                break;
                            }
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
