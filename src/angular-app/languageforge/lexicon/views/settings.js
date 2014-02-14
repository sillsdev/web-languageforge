'use strict';

angular.module(
		'settings', 
		['jsonRpc', 'ui.bootstrap', 'sf.services', 'palaso.ui.dc.entry', 'ngAnimate']
	)
	.controller('SettingsCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', 
	                                 function($scope, userService, ss, lexService, $window, $timeout) {

		$scope.currentWritingSystemId = '';
		$scope.selectWritingSystem = function(writingSystemId) {
			$scope.currentWritingSystemId = writingSystemId;
		};
		
		$scope.currentFieldId = '';
		$scope.selectField = function(fielId) {
			$scope.currentFieldId = fielId;
		};
		
		$scope.querySettings = function() {
			$scope.config = lexService.projectSettings();
		};
		
		$scope.querySettings();
		$scope.editWritingSystemsCollapsed = false;	// TODO change. Set true after layout IJH 2014-02
		
		$scope.saveWritingSystems = function() {
			$scope.editWritingSystemsCollapsed = true;
		};
		
		$scope.$watch('config.writingsystems', function(newValue) {
//			console.log("writing systems watch ", newValue);
			if (newValue != undefined) {
				for (var key in newValue.map) {
					$scope.currentWritingSystemId = key;
					break;
				}
			}
		});
	
	}])
	;
