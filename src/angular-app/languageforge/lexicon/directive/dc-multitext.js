'use strict';

angular.module('palaso.ui.dc.multitext', ['bellows.services'])
  .directive('dcMultitext', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-multitext.html',
			scope : {
				config : "=",
				model : "=",
				control : "=",
                selectField : "&"
			},
			controller: ['$scope', 'sessionService', function($scope, ss) {
                $scope.inputSystems = ss.session.projectSettings.config.inputSystems;

				$scope.inputSystemDirection = function inputSystemDirection(tag) {
					if (! (tag in $scope.inputSystems)) {
						return 'ltr';
					}
                    return ($scope.inputSystems[tag].isRightToLeft) ? 'rtl' : 'ltr';
				};

                $scope.selectInputSystem = function selectInputSystem(tag) {
                    $scope.selectField({inputSystem: tag});
                };
				
			}],
			link : function(scope, element, attrs, controller) {
			}
		};
  }])
  ;
