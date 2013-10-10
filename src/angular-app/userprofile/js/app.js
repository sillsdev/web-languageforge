'use strict';

angular.module('userProfile', ['jsonRpc', 'ui.bootstrap', 'sf.services', 'palaso.ui.notice'])
.controller('userProfileCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService',
		function userProfileCtrl($scope, userService, ss, notice) {
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
		userService.read(ss.currentUserId(), function(result) {
			if (result.ok) {
				$scope.user = result.data;
			}
		});
	};	
	
	$scope.updateUser = function() {
		userService.update($scope.user, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, "Profile updated successfully");
			}
		});
	}
	
	loadUser(); // load the user data right away
}])
;

function getAvatarUrl(color, shape) {
	var imgPath = "/images/avatar";
	if (!color || !shape) {
		return imgPath + "/anonymoose.png";
	}
	return imgPath + "/" + color + "-" + shape + "-128x128.png";
}

