'use strict';

angular.module('registration', [ 'sf.services', 'ui.bootstrap', 'palaso.ui.notice'])
.controller('UserCtrl', ['$scope', '$location', 'userService', 'sessionService', 'silNoticeService', function UserCtrl($scope, $location, userService, sessionService, notice) {

	$scope.record = {};
	$scope.record.id = '';
	$scope.showForm = false;
	
	// initialize the page by reading the user with the given validation key
	var validationKey = ''; // get this from the URL
	userService.readForRegistration(validationKey, function(result) {
		if (result.ok) {
			if (result.data.canRegister) {
				$scope.showForm = true;
				$scope.record = result.data.user;
			} else {
				notice.push(notice.WARN, "We cannot complete the registration process for you at this time.  Please <a href='/app/signup'>sign up here</a> instead.");
			}
		}
	});
	
	$scope.registerUser = function(record) {
		$scope.requestInProgress = true;
		userService.updateFromRegistration(validationKey, record, function(result) {
			$scope.requestInProgress = false;
			if (result.ok) {
				if (result.data) {
					notice.push(notice.SUCCESS, "Thank you, " + record.name + ", for joining!  You can now login.");
					$("#userForm").fadeOut(500, function() {
						$location.path('/auth/login');
					});
				}
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
				$scope.userNameLoading = false;
				if (result.ok) {
					if (result.data) {
						$scope.userNameOk = false;
						$scope.userNameExists = true;
					} else {
						$scope.userNameOk = true;
						$scope.userNameExists = false;
					}
				}
			});
		}
	}
}])
;