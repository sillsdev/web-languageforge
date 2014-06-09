'use strict';

angular.module('palaso.ui.picklistEditor', [])
.directive('picklistEditor', function() {
	console.log('Setting up picklistEditor directive');
	return {
		restrict: 'AE',
		templateUrl: '/angular-app/bellows/directive/picklist-editor.html',
		scope: {
			values: '=',
			picklistName: '@name',
		},
	};
});
