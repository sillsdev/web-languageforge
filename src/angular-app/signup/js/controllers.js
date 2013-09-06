'use strict';

/* Controllers */

angular.module(
	'signup.controllers',
	[ 'sf.services', 'ui.bootstrap' ]
)
.controller('UserCtrl', ['$scope', 'userService', function UserCtrl($scope, userService) {

	$scope.record = {};
	$scope.success = {
		'state':false,
		'message':''
	};
	$scope.record.id = '';
	$scope.record.password = '';
	$scope.createUser = function(record) {
		userService.create(record, function(result) {
			if (result.ok) {
				$scope.success.state = true;
				$scope.success.message = "";
			} else {
				$scope.success.state = false;
				$scope.success.message = "An error occurred in the signup process";
			}
		});
		return true;
	};
	$scope.checkUserName = function() {
		$scope.userNameOk = false;
		$scope.userNameExists = false;
		if ($scope.record.username) {
			$scope.userNameLoading = true;
			userService.userNameExists($scope.record.username, function(result) {
				console.log(typeof(result.data));
				$scope.userNameLoading = false;
				if (result.ok) {
					if (result.data) {
						$scope.userNameOk = false;
						$scope.userNameExists = true;
					} else {
						$scope.userNameOk = true;
						$scope.userNameExists = false;
					}
				} else {
					$scope.success.state = false;
					$scope.success.message = "An error occurred checking for an username";
				}
			});
		}
	}
}])
;
