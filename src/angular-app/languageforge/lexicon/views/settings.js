'use strict';

angular.module(
		'settings', 
		['jsonRpc', 'ui.bootstrap', 'sf.services', 'palaso.ui.dc.entry', 'ngAnimate']
	)
	.controller('SettingsCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', 
	                                 function($scope, userService, ss, lexService, $window, $timeout) {

		$scope.currentListId = '';
		$scope.selectList = function(listId) {
//			console.log("selectList ", listId);
			$scope.currentListId = listId;
		};
		
		$scope.querySettings = function() {
			$scope.config = lexService.projectSettings();
		};
		
		$scope.querySettings();
		$scope.editWritingSystemsCollapsed = false;	// TODO change. Set true after layout IJH 2014-02
		
		$scope.saveWritingSystems = function() {
			$scope.editWritingSystemsCollapsed = true;
		};
		
	}])
	;
