'use strict';

angular.module('projects', ['bellows.services', 'palaso.ui.listview', 'ui.bootstrap', 'palaso.ui.notice', 'wc.Directives'])
.controller('ProjectsCtrl', ['$scope', 'projectService', 'sessionService', 'silNoticeService', 'modalService', '$window',
                             function($scope, projectService, ss, notice, modalService, $window) {
	$scope.finishedLoading = false;

	// Rights
	$scope.rights = {};
	$scope.rights.edit = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT); 
	$scope.rights.archive = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.ARCHIVE); 
	$scope.rights.create = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.CREATE);
	$scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create;
	$scope.newProject = {};


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
		projectService.list(function(result) {
			if (result.ok) {
				$scope.projects = result.data.entries;
				$scope.projectCount = result.data.count;
				$scope.finishedLoading = true;
			}
		});
	};
	
	// Archive projects
	$scope.archiveProjects = function() {
		var projectIds = [];
		var message = '';
		for(var i = 0, l = $scope.selected.length; i < l; i++) {
			projectIds.push($scope.selected[i].id);
		}
		if (projectIds.length == 1) {
			message = "Are you sure you want to archive the selected project?";
		} else {
			message = "Are you sure you want to archive the " + projectIds.length + " selected projects?";
		}
		var modalOptions = {
				closeButtonText: 'Cancel',
				actionButtonText: 'Archive',
				headerText: 'Archive Project?',
				bodyText: message
			};
		modalService.showModal({}, modalOptions).then(function (result) {
			projectService.archive(projectIds, function(result) {
				if (result.ok) {
					$scope.selected = []; // Reset the selection
					$scope.queryProjectsForUser();
					if (projectIds.length == 1) {
						notice.push(notice.SUCCESS, "The project was archived successfully");
					} else {
						notice.push(notice.SUCCESS, "The projects were archived successfully");
					}
				}
			});
		});
	};
	
	// Add new project
	$scope.addProject = function() {
		projectService.create($scope.newProject.projectName, $scope.newProject.appName, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, "The " + $scope.newProject.projectName + " project was created successfully");
				$scope.queryProjectsForUser();
				$scope.newProject = {};
			}
		});
	};

	$scope.isInProject = function(project) {
			if (project.role == 'contributor' || project.role == 'project_manager') {
			return true;
		}
		return false;
	};

	$scope.isManager = function(project) {
			if (project.role == 'project_manager') {
			return true;
		}
		return false;
	};

	// Add user as Manager of project
	$scope.addManagerToProject = function(project) {
		projectService.joinProject(project.id, 'project_manager', function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, "You are now a Manager of the " + project.projectName + " project.");
				$scope.queryProjectsForUser();
			}
		});
	};

	// Add user as Member of project
	$scope.addMemberToProject = function(project) {
		projectService.joinProject(project.id, 'contributor', function(result) {
			if (result.ok) {
					notice.push(notice.SUCCESS, "You are now a Contributor for the " + project.projectName + " project.");
				$scope.queryProjectsForUser();
			}
		});
	};

	$scope.projectTypeNames = projectService.data.projectTypeNames;
	$scope.projectTypesBySite = projectService.data.projectTypesBySite;
	
}])
;
