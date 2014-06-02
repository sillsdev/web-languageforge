'use strict';

angular.module(
		'projects',
		[ 'bellows.services', 'palaso.ui.listview', 'ui.bootstrap', 'palaso.ui.notice', 'wc.Directives' ]
)
.controller('ProjectsCtrl', ['$scope', 'projectService', 'sessionService', 'silNoticeService', '$window',
                             function($scope, projectService, ss, notice, $window) {
	
		$scope.finishedLoading = false;

		// Rights
		$scope.rights = {};
		$scope.rights.deleteOther = ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.DELETE); 
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
		
		// Remove
		$scope.removeProject = function() {
			//console.log("removeProject()");
			var projectIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				projectIds.push($scope.selected[i].id);
			}
			if (window.confirm("Are you sure you want to delete the(se) " + projectIds.length + " project(s)? (Deleting a project is a big deal)")) {
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
			}
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
			if (project.role == 'user' || project.role == 'project_admin') {
				return true;
			}
			return false;
		};

		$scope.isManager = function(project) {
			if (project.role == 'project_admin') {
				return true;
			}
			return false;
		};

		// Add user as Manager of project
		$scope.addManagerToProject = function(project) {
//			console.log("addManagerToProject(" + project.projectname + ")");
			var user = {};
			user.id = ss.currentUserId();
			user.role = 'project_admin';
			projectService.updateUser(project.id, user, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "You are now a Manager of the " + project.projectname + " project.");
					$scope.queryProjectsForUser();
				}
			});
		};

		// Add user as Member of project
		$scope.addMemberToProject = function(project) {
//			console.log("addMemberToProject(" + project.projectname + ")");
			var user = {};
			user.id = ss.currentUserId();
			user.role = 'user';
			projectService.updateUser(project.id, user, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "You are now a Member of the " + project.projectname + " project.");
					$scope.queryProjectsForUser();
				}
			});
		};

		$scope.site = ss.site;
		
		$scope.getBaseHost = function(hostname) {
			var parts = hostname.split('.');
			if (parts[0] == 'www' || parts[0] == 'dev' || parts[0] == 'scriptureforge' || parts[0] == 'languageforge') {
				return hostname;
			}
			return hostname.substring(hostname.indexOf('.') + 1);
		};
		
		$scope.getProjectHost = function(theme) {
			var baseHost = $scope.getBaseHost($window.location.hostname);
			if (theme != 'default') {
				return $window.location.protocol + '//' + theme + '.' + baseHost;
			} else {
				return $window.location.protocol + '//' + baseHost;
			}
		};
		
		$scope.projectTypes = {
			'sfchecks': 'Community Scripture Checking',
			'rapuma': 'Publishing',
			'lexicon': 'Web Dictionary'
		};
		
		$scope.projectTypesBySite = {
			'scriptureforge': ['sfchecks'],
			'languageforge': ['lexicon']
		};
	}])
	;
