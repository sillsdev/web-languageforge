'use strict';

angular.module('sf.ui.invitefriend', ['bellows.services', 'palaso.ui.notice'])
	.controller('inviteAFriend', ['$scope', 'userService', 'silNoticeService', '$location', '$rootScope', '$routeParams', function($scope, userService, notice, $location, $rootScope, $routeParams) {
		
		$scope.showInviteForm = false;
		$scope.showInviteDiv = true;
		
		$scope.checkVisibility = function() {
			$scope.showInviteDiv = true;
		};
		
		$rootScope.$on('$viewContentLoaded', function (event, next, current) {
			$scope.checkVisibility();
		});
		
		$scope.sendInvite = function() {
			userService.sendInvite($scope.email, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "An invitation email has been sent to " + $scope.email);
					$scope.showInviteForm = false;
					$scope.email = '';
				}
			});
		};
		
		$scope.checkVisibility();
	}])
	;
