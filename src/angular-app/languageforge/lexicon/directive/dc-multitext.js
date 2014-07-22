'use strict';

angular.module('palaso.ui.dc.multitext', ['bellows.services'])
  .directive('dcMultitext', [function() {
		return {
			restrict : 'E',
			templateUrl : '/angular-app/languageforge/lexicon/directive/dc-multitext.html',
			scope : {
				config : "=",
				model : "=",
				control : "="
			},
			controller: ['$scope', 'sessionService', function($scope, ss) {
                $scope.inputSystems = ss.session.projectSettings.config.inputSystems;

				$scope.inputSystemDirection = function inputSystemDirection(tag) {
                    return ($scope.inputSystems[tag].isRightToLeft) ? 'rtl' : 'ltr';
				};
				
			}],
			link : function(scope, element, attrs, controller) {
			}
		};
  }])
  ;
