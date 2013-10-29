'use strict';

// Declare app level module which depends on filters, and services
angular.module('activity', 
		[
		 'ngRoute',
		 'sf.services',
		 'ui.bootstrap',
		 'activity.filters',
		 'sgw.ui.breadcrumb',
		 'sf.ui.invitefriend'
		])
	.controller('ActivityCtrl', ['$scope', 'activityPageService', 'linkService', 'sessionService','breadcrumbService',
	                             function($scope, activityService, linkService, sessionService, breadcrumbService) {
		
		// Breadcrumb
		breadcrumbService.set('top',
				[
				 {label: 'Activity'},
				]
		);
		
		$scope.unread = [];
		
		$scope.isUnread = function(id) {
			return ($.inArray(id, $scope.unread) > -1);
		};

		$scope.decodeActivityList = function(items) {
			for (var i =0; i < items.length; i++) {
				if ('userRef' in items[i]) {
					items[i].userHref = linkService.user(items[i].userRef.id);
				}
				if ('userRef2' in items[i]) {
					items[i].userHref2 = linkService.user(items[i].userRef2.id);
				}
				if ('projectRef' in items[i]) {
					items[i].projectHref = linkService.project(items[i].projectRef);
				}
				if ('textRef' in items[i]) {
					items[i].textHref = linkService.text(items[i].projectRef, items[i].textRef);
				}
				if ('questionRef' in items[i]) {
					items[i].questionHref = linkService.question(items[i].projectRef, items[i].textRef, items[i].questionRef);				}
			}
		}
		activityService.list_activity(0, 50, function(result) {
			if (result.ok) {
				$scope.activities = [];
				$scope.unread = result.data.unread;
				for (var key in result.data.activity) {
					$scope.activities.push(result.data.activity[key]);
				}
				$scope.decodeActivityList($scope.activities);
				$scope.filteredActivities = $scope.activities;
			} else {
				// error condition
				console.log("error loading activity");
			}
		});
		$scope.showAllActivity = true;
		
		
		$scope.filterAllActivity = function() {
			$scope.showAllActivity = true;
			$scope.filteredActivities = $scope.activities;
		};
		
		$scope.filterMyActivity = function() {
			$scope.showAllActivity = false;
			$scope.filteredActivities = [];
			for (var i in $scope.activities) {
				var a = $scope.activities[i];
				if (a.userRef && a.userRef.id == sessionService.currentUserId() || a.userRef2 && a.userRef2.id == sessionService.currentUserId()) {
					$scope.filteredActivities.push(a);
				} 
			}
		};
	}])
	;
