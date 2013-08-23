'use strict';

angular.module(
		'sfchecks.project',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('ProjectCtrl', ['$scope', 'textService', '$routeParams', 'sessionService', 'breadcrumbService', 'linkService', 
	                            function($scope, textService, $routeParams, ss, bcs, linkService) {
		var projectId = $routeParams.projectId;
		$scope.projectId = projectId;
		
		// Rights
		$scope.rights = {};
		$scope.rights.deleteOther = false; 
		$scope.rights.create = false; 
		$scope.rights.editOther = false; //ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.EDIT_OTHER);
		$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
		
		// Listview Selection
		$scope.newTextCollapsed = true;
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
		$scope.texts = [];
		$scope.queryTexts = function() {
			console.log("queryTexts()");
			textService.list(projectId, function(result) {
				if (result.ok) {
					$scope.texts = result.data.entries;
					$scope.enhanceDto($scope.texts);
					$scope.textsCount = result.data.count;

					$scope.project = result.data.project;
					$scope.project.url = linkService.project(projectId);
					bcs.updateMap('project', $scope.project.id, $scope.project.name);

					var rights = result.data.rights;
					$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.DELETE_OTHER); 
					$scope.rights.create = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.CREATE); 
					$scope.rights.editOther = ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.EDIT_OTHER);
					$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
				}
			});
		};
		// Remove
		$scope.removeTexts = function() {
			console.log("removeTexts()");
			var textIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				textIds.push($scope.selected[i].id);
			}
			if (l == 0) {
				// TODO ERROR
				return;
			}
			textService.remove(projectId, textIds, function(result) {
				if (result.ok) {
					$scope.selected = []; // Reset the selection
					$scope.queryTexts();
					// TODO
				}
			});
		};
		// Add
		$scope.addText = function() {
			console.log("addText()");
			var model = {};
			model.id = '';
			model.title = $scope.title;
			model.content = $scope.content;
			textService.update(projectId, model, function(result) {
				if (result.ok) {
					$scope.queryTexts();
				}
			});
		};

		// Fake data to make the page look good while it's being designed. To be
		// replaced by real data once the appropriate API functions are writen.
		var fakeData = {
			questionCount: -7,
			viewsCount: -34,
			unreadAnswers: -3,
			unreadComments: -8
		};

		$scope.getQuestionCount = function(text) {
			return text.questionCount;
		};

		$scope.getViewsCount = function(text) {
			return fakeData.viewsCount;
		};

		$scope.getUnreadAnswers = function(text) {
			return fakeData.unreadAnswers;
		};

		$scope.getUnreadComments = function(text) {
			return fakeData.unreadComments;
		};
		
		$scope.enhanceDto = function(items) {
			for (var i in items) {
				items[i].url = linkService.text($scope.projectId, items[i].id);
			}
		};

	}])
	.controller('ProjectSettingsCtrl', ['$scope', '$location', '$routeParams', 'breadcrumbService', 'userService', 'projectService', 'sessionService',
	                                 function($scope, $location, $routeParams, bcs, userService, projectService, ss) {
		var projectId = $routeParams.projectId;
		$scope.project = {};
		console.log("project id", projectId);
		console.log("bcs", bcs.idmap);
		$scope.project.id = projectId;
		if (bcs.idmap[projectId] != undefined) {
			$scope.project.name = bcs.idmap[projectId].name;			
		}

		$scope.updateProject = function() {
			var newProject = {
				id: $scope.project.id,
				projectname: $scope.project.name
			};
			projectService.update(newProject, function(result) {
				if (result.ok) {
					console.log('Updated OK');
				}
			});
		};
	
		// ----------------------------------------------------------
		// List
		// ----------------------------------------------------------
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
		
		$scope.users = [];
		$scope.queryProjectUsers = function() {
			projectService.listUsers($scope.project.id, function(result) {
				if (result.ok) {
					$scope.project.name = result.data.projectName;
					$scope.project.users = result.data.entries;
					$scope.project.userCount = result.data.count;
					// Rights
					var rights = result.data.rights;
					$scope.rights = {};
					$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.DELETE_OTHER); 
					$scope.rights.create = ss.hasRight(rights, ss.domain.USERS, ss.operation.CREATE); 
					$scope.rights.editOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.EDIT_OTHER);
					$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
					
				}
			});
		};
		
		$scope.removeProjectUsers = function() {
			console.log("removeUsers");
			var userIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				userIds.push($scope.selected[i].id);
			}
			if (l == 0) {
				// TODO ERROR
				return;
			}
			projectService.removeUsers($scope.project.id, userIds, function(result) {
				if (result.ok) {
					$scope.queryProjectUsers();
					// TODO
				}
			});
		};
		
		// Roles in list
		$scope.roles = [
	        {key: 'user', name: 'User'},
	        {key: 'project_admin', name: 'Project Admin'}
        ];
		
		$scope.onRoleChange = function(user) {
			var model = {};
			model.id = user.id;
			model.role = user.role;
			console.log('userchange...', model);
			projectService.updateUser($scope.project.id, model, function(result) {
				if (result.ok) {
					// TODO broadcast notice
					console.log('userchanged');
				}
			});
		};
		
		// ----------------------------------------------------------
		// Typeahead
		// ----------------------------------------------------------
	    $scope.users = [];
	    $scope.addModes = {
	    	'addNew': { 'en': 'Create New', 'icon': 'icon-user'},
	    	'addExisting' : { 'en': 'Add Existing', 'icon': 'icon-user'},
	    	'invite': { 'en': 'Send Invite', 'icon': 'icon-envelope'}
	    };
	    $scope.addMode = 'addNew';
		
		$scope.queryUser = function(term) {
			console.log('searching for ', term);
			userService.typeahead(term, function(result) {
				// TODO Check term == controller view value (cf bootstrap typeahead) else abandon.
				if (result.ok) {
					$scope.users = result.data.entries;
					$scope.updateAddMode();
				}
			});
		};
		$scope.addModeText = function(addMode) {
			return $scope.addModes[addMode].en;
		};
		$scope.addModeIcon = function(addMode) {
			return $scope.addModes[addMode].icon;
		};
		$scope.updateAddMode = function() {
			// TODO This isn't adequate.  Need to watch the 'term' and 'selection' also. CP 2013-07
			if ($scope.users.length == 0) {
				$scope.addMode = 'addNew';
			} else if ($scope.users.length == 1) {
				$scope.addMode = 'addExisting';
			}
		};
		
		$scope.addProjectUser = function() {
			var model = {};
			if ($scope.addMode == 'addNew') {
				model.name = $scope.term;
			} else if ($scope.addMode == 'addExisting') {
				model.id = $scope.user.id;
			} else if ($scope.addMode == 'invite') {
				$model.email = $scope.term;
			}
			console.log("addUser ", model);
			projectService.updateUser($scope.project.id, model, function(result) {
				if (result.ok) {
					// TODO broadcast notice and add
					$scope.queryProjectUsers();
				}
			});
		};
	
		$scope.selectUser = function(item) {
			console.log('user selected', item);
			$scope.user = item;
			$scope.term = item.name;
		};
	
		$scope.imageSource = function(avatarRef) {
			return avatarRef ? '/images/avatar/' + avatarRef : '/images/avatar/anonymous02.png';
		};
	
	}])
	;
