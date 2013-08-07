'use strict';

function getAvatarUrl(color, shape) {
	var imgPath = "/images/avatar";
	if (!color || !shape) {
		return imgPath + "/anonymoose.png";
	}
	return imgPath + "/" + color + "-" + shape + "-128x128.png";
}

function userProfileCtrl($scope, userService) {
	$scope.notify = {};
	$scope.user = {};
	$scope.user.avatar_color = '';
	$scope.user.avatar_shape = '';
	$scope.user.avatar_ref = getAvatarUrl('', '');
	
	$scope.$watch('user.avatar_color', function() {
		$scope.user.avatar_ref = getAvatarUrl($scope.user.avatar_color, $scope.user.avatar_shape);
	});
	$scope.$watch('user.avatar_shape', function() {
		$scope.user.avatar_ref = getAvatarUrl($scope.user.avatar_color, $scope.user.avatar_shape);
	});
	
	var loadUser = function() {
		userService.read(window.session.userid, function(result) {
			if (result.ok) {
				$scope.user = result.data;
			} else {
				// TODO report the real error
				$scope.notify.error = 'something went wrong';
			}
		});
	};	
	
	$scope.updateUser = function() {
		userService.update($scope.user, function(result) {
			if (result.ok) {
				console.log("updated user profile successfully.");
				$scope.notify.message = "Profile updated successfully.";
			} else {
				// TODO report the real error
				$scope.notify.error = 'something went wrong';
				console.log("error updating user profile.");
			}
		});
	}
	
	loadUser(); // load the user data right away
}

angular.module('userProfile', ['jsonRpc', 'ui.bootstrap', 'sf.services']).
controller('userProfileCtrl', ['$scope', 'userService', userProfileCtrl])
;
