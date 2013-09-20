'use strict';

angular.module(
		'sfchecks.projects',
		[ 'sf.services', 'palaso.ui.listview', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice' ]
)
.controller('ProjectsCtrl', ['$scope', 'projectService', 'sessionService', 'breadcrumbService', 'linkService', 'silNoticeService',
                             function($scope, projectService, ss, breadcrumbService, linkService, notice) {
		// Rights
		$scope.rights = {};
		$scope.rights.deleteOther = ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.DELETE_OTHER); 

		// Breadcrumb
		breadcrumbService.set('top',
				[
				 {href: '/app/sfchecks#/projects', label: 'My Projects'},
				]
		);

		// Listview Selection
		$scope.newProjectCollapsed = true;
		$scope.selected = [];
		$scope.updateSelection = function(event, item) {
			var selectedIndex = $scope.selected.indexOf(item);
			var checkbox = event.target;
			if (checkbox.checked && selectedIndex == -1) {
				$scope.selected.push(item);
			} else if (!checkbox.checked && selectedIndex != -1) {
				$scope.selected.splice(selectedIndex, 1);
			}
		};
		$scope.isSelected = function(item) {
			return item != null && $scope.selected.indexOf(item) >= 0;
		};
		// Listview Data
		$scope.projects = [];
		$scope.queryProjectsForUser = function() {
			console.log("queryProjectForUser()");
			projectService.list(function(result) {
				if (result.ok) {
					$scope.projects = result.data.entries;
					$scope.enhanceDto($scope.projects);
					$scope.projectCount = result.data.count;
				}
			});
		};
		// Remove
		$scope.removeProject = function() {
			console.log("removeProject()");
			var projectIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				projectIds.push($scope.selected[i].id);
			}
			if (l == 0) {
				// TODO ERROR
				return;
			}
			projectService.remove(projectIds, function(result) {
				if (result.ok) {
					$scope.selected = []; // Reset the selection
					$scope.queryProjectsForUser();
					if (projectIds.length == 1) {
						notice.push(notice.SUCCESS, "The project was removed successfully");
					} else {
						notice.push(notice.SUCCESS, "The projects were removed successfully");
					}
				}
			});
		};
		// Add
		$scope.addProject = function() {
			console.log("addProject()");
			var model = {};
			model.id = '';
			model.projectname = $scope.projectName;
			projectService.update(model, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "The " + $scope.projectName + " project was created successfully");
					$scope.queryProjectsForUser();
					$scope.projectName = '';
				}
			});
		};

		// Fake data to make the page look good while it's being designed. To be
		// replaced by real data once the appropriate API functions are writen.
		var fakeData = {
			textCount: -3,
			viewsCount: -93,
			unreadAnswers: -4,
			unreadComments: -12
		};

		$scope.getTextCount = function(project) {
			// return projects.texts.count;
			return project.textCount;
		};

		$scope.getViewsCount = function(project) {
			return fakeData.viewsCount;
		};

		$scope.getUnreadAnswers = function(project) {
			return fakeData.unreadAnswers;
		};

		$scope.getUnreadComments = function(project) {
			return fakeData.unreadComments;
		};
		
		$scope.enhanceDto = function(items) {
			for (var i in items) {
				items[i].url = linkService.project(items[i].id);
			}
		}
	}])
	;
