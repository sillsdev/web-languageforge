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
                    for (var i=0; i<config.values.length; i++) {
                        if (config.values[i].key == value) {
                            displayName = config.values[i].value;
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
