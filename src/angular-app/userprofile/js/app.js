'use strict';

function userProfileCtrl($scope, userService) {
	$scope.user = {'name' : 'Chris', 'id': 1};
	
	var loadUser = function() {
		userService.read(window.session.userid, function(result) {
			if (result.ok) {
				$scope.user = result.data;
			} else {
				// TODO report the real error
				$scope.error = true;
				$scope.errorMessage = 'something went wrong';
			}
		});
	};	
	loadUser();
}

angular.module('userProfile', ['jsonRpc', 'ui.bootstrap', 'sf.services']).
controller('userProfileCtrl', ['$scope', 'userService', userProfileCtrl])
;
