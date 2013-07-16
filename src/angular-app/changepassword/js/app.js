'use strict';

function changePasswordCtrl($scope, userService, sessionService) {
	$scope.notify = {};
	
	$scope.updatePassword = function() {
		userService.changePassword(sessionService.currentUserId(), $scope.password, function(result) {
			if (result.ok) {
				$scope.notify.message = "Password Updated successfully";
			} else {
				$scope.notify.error = "Error updating password";
			}
		});
	}
}

angular.module('changePassword', ['jsonRpc', 'ui.bootstrap', 'sf.services']).
controller('changePasswordCtrl', ['$scope', 'userService', 'sessionService', changePasswordCtrl])
;
