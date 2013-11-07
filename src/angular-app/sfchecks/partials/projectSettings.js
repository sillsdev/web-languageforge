'use strict';

angular.module(
		'sfchecks.project',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice', 'palaso.ui.textdrop', 'palaso.ui.jqte', 'angularFileUpload' ]
	)
	.controller('ProjectSettingsCtrl', ['$scope', '$location', '$routeParams', 'breadcrumbService', 'userService', 'projectService', 'sessionService', 'silNoticeService', 'messageService',
	                                 function($scope, $location, $routeParams, breadcrumbService, userService, projectService, ss, notice, messageService) {
		var projectId = $routeParams.projectId;
		$scope.project = {};
		$scope.settings = {
			'sms': {},
			'email': {}
		};
		$scope.project.id = projectId;

		// Breadcrumb
		breadcrumbService.set('top',
				[
				 {href: '/app/sfchecks#/projects', label: 'My Projects'},
				 {href: '/app/sfchecks#/project/' + $routeParams.projectId, label: ''},
				 {href: '/app/sfchecks#/project/' + $routeParams.projectId + '/settings', label: 'Details'},
				]
		);
		
		$scope.message = {};
		$scope.newMessageCollapsed = true;
		$scope.sendMessageToSelectedUsers = function() {
			var userIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				userIds.push($scope.selected[i].id);
			}
			messageService.send($scope.project.id, userIds, $scope.message.subject, $scope.message.emailTemplate, $scope.message.smsTemplate, function(result) {
				if (result.ok) {
					$scope.message.subject = '';
					$scope.message.emailTemplate = '';
					$scope.message.smsTemplate = '';
					$scope.selected = [];
					$scope.newMessageCollapsed = true;
					notice.push(notice.SUCCESS, "The message was successfully queued for sending");
				}
			});
		};

		$scope.updateProject = function() {
			// TODO this should be fine just being $scope.project from the dto.
			var newProject = {
				id: $scope.project.id,
				projectname: $scope.project.name,
				projectCode: $scope.project.projectCode,
				featured: $scope.project.featured
			};
			projectService.update(newProject, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, $scope.project.name + " settings updated successfully");
				}
			});
		};
		
		$scope.updateCommunicationSettings = function() {
			projectService.updateSettings($scope.project.id, $scope.settings.sms, $scope.settings.email, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, $scope.project.name + " SMS settings updated successfully");
				}
			});
		};
		
		$scope.readCommunicationSettings = function() {
			projectService.readSettings($scope.project.id, function(result) {
				if (result.ok) {
					$scope.settings.sms = result.data.sms;
					$scope.settings.email = result.data.email;
				}
			});
		};
		
		$scope.canEditCommunicationSettings = function() {
			return ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.EDIT_OTHER);
		};
		
		
		// jqte options for html email message composition
		$scope.jqteOptions = {
			'placeholder': 'Email Message',
			'u': false,
			'indent': false,
			'outdent': false,
			'left': false,
			'center': false,
			'right': false,
			'rule': false,
			'source': false,
			'link': false,
			'unlink': false,
			'fsize': false,
			'sub': false,
			'color': false,
			'format': false,
			'formats': [
				['p', 'Normal'],
				['h4', 'Large']
			]
		};
		
	
		// ----------------------------------------------------------
		// List
		// ----------------------------------------------------------
		$scope.list = {};
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
		
		$scope.queryProjectSettings = function() {
			projectService.projectSettings($scope.project.id, function(result) {
				if (result.ok) {
					$scope.project = result.data.project;
					$scope.list.users = result.data.entries;
					$scope.list.userCount = result.data.count;
					// Rights
					var rights = result.data.rights;
					$scope.rights = {};
					$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.DELETE_OTHER); 
					$scope.rights.create = ss.hasRight(rights, ss.domain.USERS, ss.operation.CREATE); 
					$scope.rights.editOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.EDIT_OTHER);
					$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
					// Breadcrumb
					breadcrumbService.updateCrumb('top', 1, {label: result.data.bcs.project.crumb});
					
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
					$scope.queryProjectSettings();
					$scope.selected = [];
					if (userIds.length == 1) {
						notice.push(notice.SUCCESS, "The user was removed from this project");
					} else {
						notice.push(notice.SUCCESS, userIds.length + " users were removed from this project");
					}
				}
			});
		};
		
		// Roles in list
		$scope.roles = [
	        {key: 'user', name: 'Member'},
	        {key: 'project_admin', name: 'Manager'}
        ];
		
		$scope.onRoleChange = function(user) {
			var model = {};
			model.id = user.id;
			model.role = user.role;
			console.log('userchange...', model);
			projectService.updateUser($scope.project.id, model, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, user.username + "'s role was changed to " + user.role);
				}
			});
		};
		
		// ----------------------------------------------------------
		// Typeahead
		// ----------------------------------------------------------
	    $scope.users = [];
	    $scope.addModes = {
	    	'addNew': { 'en': 'Create New User', 'icon': 'icon-user'},
	    	'addExisting' : { 'en': 'Add Existing User', 'icon': 'icon-user'},
	    	'invite': { 'en': 'Send Email Invite', 'icon': 'icon-envelope'}
	    };
	    $scope.addMode = 'addNew';
	    $scope.typeahead = {};
	    $scope.typeahead.userName = '';
		
		$scope.queryUser = function(userName) {
			console.log('searching for ', userName);
			userService.typeahead(userName, function(result) {
				// TODO Check userName == controller view value (cf bootstrap typeahead) else abandon.
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
		$scope.updateAddMode = function(newMode) {
			if (newMode in $scope.addModes) {
				$scope.addMode = newMode;
			} else {
				// This also covers the case where newMode is undefined
				$scope.calculateAddMode();
			}
		};
		
		$scope.calculateAddMode = function() {
			// TODO This isn't adequate.  Need to watch the 'typeahead.userName' and 'selection' also. CP 2013-07
			if ($scope.typeahead.userName.indexOf('@') != -1) {
				$scope.addMode = 'invite';
			} else if ($scope.users.length == 0) {
				$scope.addMode = 'addNew';
			} else if (!$scope.typeahead.userName) {
				$scope.addMode = 'addNew';
			} else {
				$scope.addMode = 'addExisting';
			}
		};
		
		$scope.addProjectUser = function() {
			if ($scope.addMode == 'addNew') {
				userService.createSimple($scope.typeahead.userName, $scope.project.id, function(result) {
					if (result.ok) {
						notice.push(notice.SUCCESS, "User created.  Username: " + $scope.typeahead.userName + "    Password: " + result.data.password);
						$scope.queryProjectUsers();
					};
				});
			} else if ($scope.addMode == 'addExisting') {
				var model = {};
				model.id = $scope.user.id;
				projectService.updateUser($scope.project.id, model, function(result) {
					if (result.ok) {
						notice.push(notice.SUCCESS, "'" + $scope.user.name + "' was added to " + $scope.project.name + " successfully");
						$scope.queryProjectUsers();
					}
				});
			} else if ($scope.addMode == 'invite') {
				userService.sendInvite($scope.typeahead.userName, $scope.project.id, function(result) {
					if (result.ok) {
						notice.push(notice.SUCCESS, "'" + $scope.typeahead.userName + "' was invited to join the project " + $scope.project.name);
						$scope.queryProjectUsers();
					}
				});
			}
		};
	
		$scope.selectUser = function(item) {
			console.log('user selected', item);
			$scope.user = item;
			$scope.typeahead.userName = item.name;
			$scope.updateAddMode('addExisting');
		};
	
		$scope.imageSource = function(avatarRef) {
			return avatarRef ? '/images/avatar/' + avatarRef : '/images/avatar/anonymous02.png';
		};
	
	}])
	;
