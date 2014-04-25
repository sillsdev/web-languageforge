'use strict';

// Declare app level module which depends on filters, and services
angular.module('activity', 
		[
		 'ngRoute',
		 'bellows.services',
		 'ui.bootstrap',
		 'activity.filters',
		 'sgw.ui.breadcrumb',
		 'wc.Directives'
		])
	.controller('ActivityCtrl', ['$scope', '$sce', 'activityPageService', 'sfchecksLinkService', 'sessionService','breadcrumbService',
	                             function($scope, $sce, activityService, sfchecksLinkService, sessionService, breadcrumbService) {
		
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
					items[i].userHref = sfchecksLinkService.user(items[i].userRef.id);
				}
				if ('userRef2' in items[i]) {
					items[i].userHref2 = sfchecksLinkService.user(items[i].userRef2.id);
				}
				if ('projectRef' in items[i]) {
					items[i].projectHref = sfchecksLinkService.project(items[i].projectRef);
				}
				if ('textRef' in items[i]) {
					items[i].textHref = sfchecksLinkService.text(items[i].projectRef, items[i].textRef);
				}
				if ('questionRef' in items[i]) {
					items[i].questionHref = sfchecksLinkService.question(items[i].projectRef, items[i].textRef, items[i].questionRef);				}
				if ('content' in items[i]) {
					if ('answer' in items[i]['content']) {
						items[i]['content']['answer'] = $sce.trustAsHtml(items[i]['content']['answer']);
					}
					
				}
			}
		};
		activityService.list_activity(0, 50, function(result) {
			if (result.ok) {
				$scope.activities = [];
				$scope.unread = result.data.unread;
				for (var key in result.data.activity) {
					$scope.activities.push(result.data.activity[key]);
				}
				$scope.decodeActivityList($scope.activities);
				$scope.filteredActivities = $scope.activities;
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
