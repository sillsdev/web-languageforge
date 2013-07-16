'use strict';

function changePasswordCtrl($scope, userService, sessionService) {
	$scope.notify = {};
	
	$scope.updatePassword = function() {
		if ($scope.vars.password == $scope.vars.confirm_password) {
			userService.changePassword(sessionService.currentUserId(), $scope.vars.password, function(result) {
				if (result.ok) {
					$scope.notify.message = "Password Updated successfully";
				} else {
					$scope.notify.error = "Error updating password";
				}
			});
		}
	}
}

angular.module('changePassword', ['jsonRpc', 'ui.bootstrap', 'sf.services', 'ui.validate']).
controller('changePasswordCtrl', ['$scope', 'userService', 'sessionService', changePasswordCtrl])
;
