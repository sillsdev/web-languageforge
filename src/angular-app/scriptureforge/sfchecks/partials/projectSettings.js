'use strict';

angular.module('sfchecks.projectSettings', ['bellows.services', 'sfchecks.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice', 'palaso.ui.textdrop', 'palaso.ui.jqte', 'angularFileUpload'])
.controller('ProjectSettingsCtrl', ['$scope', '$location', '$routeParams', 'breadcrumbService', 'userService', 'sfchecksProjectService', 'sessionService', 'silNoticeService', 'messageService', 'sfchecksLinkService',
                                    function($scope, $location, $routeParams, breadcrumbService, userService, sfchecksProjectService, ss, notice, messageService, sfchecksLinkService) {
	var projectId = $routeParams.projectId;
	$scope.project = {};
	$scope.finishedLoading = false;
	$scope.list = {};
	$scope.project.id = projectId;

	$scope.canEditCommunicationSettings = function() {
		return ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.EDIT);
	};
	
	$scope.queryProjectSettings = function() {
		sfchecksProjectService.projectSettings($scope.project.id, function(result) {
			if (result.ok) {
				$scope.project = result.data.project;
				$scope.list.users = result.data.entries;
				$scope.list.userCount = result.data.count;
				// Rights
				var rights = result.data.rights;
				$scope.rights = {};
				$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.DELETE); 
				$scope.rights.create = ss.hasRight(rights, ss.domain.USERS, ss.operation.CREATE); 
				$scope.rights.editOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.EDIT);
				$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;

				// Breadcrumb
				breadcrumbService.set('top',
						[
						 {href: '/app/projects', label: 'My Projects'},
						 {href: sfchecksLinkService.project($routeParams.projectId), label: result.data.bcs.project.crumb},
						 {href: sfchecksLinkService.project($routeParams.projectId) + '/settings', label: 'Settings'},
						]
				);
				$scope.finishedLoading = true;
				
			}
		});
	};
	
	$scope.settings = {
		'sms': {},
		'email': {}
	};
		
	$scope.readCommunicationSettings = function() {
		sfchecksProjectService.readSettings($scope.project.id, function(result) {
			if (result.ok) {
				$scope.settings.sms = result.data.sms;
				$scope.settings.email = result.data.email;
				$scope.finishedLoading = true;
			}
		});
	};


}])
.controller('ProjectSettingsQTemplateCtrl', ['$scope', 'jsonRpc', 'silNoticeService', 'questionTemplateService', function($scope, jsonRpc, notice, qts) {
	$scope.selected = [];
	$scope.vars = {
		selectedIndex: -1,
	};
	$scope.updateSelection = function(event, item) {
		var selectedIndex = $scope.selected.indexOf(item);
		var checkbox = event.target;
		if (checkbox.checked && selectedIndex == -1) {
			$scope.selected.push(item);
		} else if (!checkbox.checked && selectedIndex != -1) {
			$scope.selected.splice(selectedIndex, 1);
		}
		$scope.vars.selectedIndex = selectedIndex; // Needed?
	};
	$scope.isSelected = function(item) {
		return item != null && $scope.selected.indexOf(item) >= 0;
	};

	$scope.editTemplateButtonText = 'Add New Template';
	$scope.editTemplateButtonIcon = 'plus';
	$scope.$watch('selected.length', function(newval) {
		if (newval >= 1) {
			$scope.editTemplateButtonText = 'Edit Template';
			$scope.editTemplateButtonIcon = 'pencil';
		} else {
			$scope.editTemplateButtonText = 'Add New Template';
			$scope.editTemplateButtonIcon = 'plus';
		}
	});
	$scope.editedTemplate = {
		id: '',
		title: '',
		description: '',
	};
	$scope.templateEditorVisible = false;
	$scope.showTemplateEditor = function(template) {
		$scope.templateEditorVisible = true;
		if (template) {
			$scope.editedTemplate = template;
		} else {
			$scope.editedTemplate.id = '';
			$scope.editedTemplate.title = '';
			$scope.editedTemplate.description = '';
		}
	};
	$scope.hideTemplateEditor = function() {
		$scope.templateEditorVisible = false;
	};
	$scope.toggleTemplateEditor = function() {
		// Can't just do "visible = !visible" because show() has logic we need to run
		if ($scope.templateEditorVisible) {
			$scope.hideTemplateEditor();
		} else {
			$scope.showTemplateEditor();
		}
	};
	$scope.editTemplate = function() {
		if ($scope.editedTemplate.title && $scope.editedTemplate.description) {
			qts.update($scope.project, $scope.editedTemplate, function(result) {
				if (result.ok) {
					if ($scope.editedTemplate.id) {
						notice.push(notice.SUCCESS, "The template '" + $scope.editedTemplate.title + "' was updated successfully");
					} else {
						notice.push(notice.SUCCESS, "The new template '" + $scope.editedTemplate.title + "' was added successfully");
					}
					$scope.hideTemplateEditor();
					$scope.selected = [];
					$scope.vars.selectedIndex = -1;
					$scope.queryTemplates(true);
				}
			});
		}
	};

	$scope.templates = [];
	$scope.queryTemplates = function(invalidateCache) {
		var forceReload = (invalidateCache || (!$scope.templates) || ($scope.templates.length == 0));
		if (forceReload) {
			qts.list(function(result) {
				if (result.ok) {
					$scope.templates = result.data.entries;
					$scope.finishedLoading = true;
				} else {
					$scope.templates = [];
				};
			});
		} else {
			// No need to refresh the cache: do nothing
		}
	};

	$scope.removeTemplates = function() {
		var templateIds = [];
		for(var i = 0, l = $scope.selected.length; i < l; i++) {
			templateIds.push($scope.selected[i].id);
		}
		if (l == 0) {
			return;
		}
		qts.remove(templateIds, function(result) {
			if (result.ok) {
				if (templateIds.length == 1) {
					notice.push(notice.SUCCESS, "The template was removed successfully");
				} else {
					notice.push(notice.SUCCESS, "The templates were removed successfully");
				}
				$scope.selected = [];
				$scope.vars.selectedIndex = -1;
				$scope.queryTemplates(true);
			}
		});
	};

}])
.controller('ProjectSettingsCommunicationCtrl', ['$scope', '$location', '$routeParams', 'breadcrumbService', 'userService', 'sfchecksProjectService', 'sessionService', 'silNoticeService', 'messageService',
                                 function($scope, $location, $routeParams, breadcrumbService, userService, sfchecksProjectService, ss, notice, messageService) {
	$scope.updateCommunicationSettings = function() {
		sfchecksProjectService.updateSettings($scope.project.id, $scope.settings.sms, $scope.settings.email, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, $scope.project.projectname + " SMS settings updated successfully");
			}
		});
	};
	
}])
.controller('ProjectSettingsPropertiesCtrl', ['$scope', '$location', '$routeParams', 'breadcrumbService', 'userService', 'sfchecksProjectService', 'sessionService', 'silNoticeService', 'messageService',
                                 function($scope, $location, $routeParams, breadcrumbService, userService, sfchecksProjectService, ss, notice, messageService) {

	// TODO This can be moved to the page level controller, it is common with the Setup tab.
	$scope.updateProject = function() {
		// TODO this should be fine just being $scope.project from the dto.
		var newProject = {
			id: $scope.project.id,
			projectname: $scope.project.projectname,
			projectCode: $scope.project.projectCode,
			featured: $scope.project.featured
		};

		sfchecksProjectService.update(newProject, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, $scope.project.projectname + " settings updated successfully");
			}
		});
	};
	

}])
.controller('ProjectSettingsSetupCtrl', ['$scope', '$location', '$routeParams', 'breadcrumbService', 'userService', 'sfchecksProjectService', 'sessionService', 'silNoticeService', 'messageService',
                                 function($scope, $location, $routeParams, breadcrumbService, userService, sfchecksProjectService, ss, notice, messageService) {

	// TODO This can be moved to the page level controller, it is common with the Setup tab.
	$scope.currentListsEnabled = [];
	$scope.updateProject = function() {
		// populate the list of enabled user profile properties
//		console.log("updateProject ", $scope.currentListsEnabled, ' ', $scope.project.userProperties.userProfilePropertiesEnabled);
		$scope.project.userProperties.userProfilePropertiesEnabled = [];
		for (var listId in $scope.currentListsEnabled) {
			if ($scope.currentListsEnabled[listId]) {
				$scope.project.userProperties.userProfilePropertiesEnabled.push(listId);
			}
		}

		sfchecksProjectService.update($scope.project, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, $scope.project.projectname + " settings updated successfully");
			}
		});
	};
	
	$scope.currentListId = '';
	$scope.selectList = function(listId) {
//		console.log("selectList ", listId);
		$scope.currentListId = listId;
	};
	
	Array.prototype.containsKey = function(obj_key, key) {
	    var i = this.length;
	    while (i--) {
	        if (this[i][key] === obj_key) {
	            return true;
	        }
	    }
	    return false;
	};
	
	$scope.pickAddItem = function() {
//		console.log("pickAddItem ", $scope.currentListId, " ", $scope.newValue);
//		console.log($scope.project.userProperties.userProfilePickLists[$scope.currentListId]);
		if ($scope.project.userProperties.userProfilePickLists[$scope.currentListId].items == undefined) {
			$scope.project.userProperties.userProfilePickLists[$scope.currentListId].items = [];
		}
		
		if ($scope.newValue != undefined) {
			var pickItem = {};
			pickItem.key = $scope.newValue.replace(/ /gi,'_');
			pickItem.value = $scope.newValue;

			// check if item exists before adding
			if (!$scope.project.userProperties.userProfilePickLists[$scope.currentListId].items.containsKey(pickItem.key, 'key')) {
				$scope.project.userProperties.userProfilePickLists[$scope.currentListId].items.push(pickItem);
			}
		}
	};

	$scope.pickRemoveItem = function(index) {
//		console.log("pickRemoveItem ", $scope.currentListId, " ", index);
		$scope.project.userProperties.userProfilePickLists[$scope.currentListId].items.splice(index, 1);
	};
	
	$scope.$watch('project.userProperties', function(newValue) {
//		console.log("project watch ", newValue);
		if (newValue != undefined) {
			for (var key in newValue.userProfilePickLists) {
				$scope.currentListId = key;
				break;
			}
			$scope.currentListsEnabled = {};
			for (var i = 0; i < $scope.project.userProperties.userProfilePropertiesEnabled.length; i++) {
				$scope.currentListsEnabled[$scope.project.userProperties.userProfilePropertiesEnabled[i]] = true;
			}
		}
	});

}])
.controller('ProjectSettingsUsersCtrl', ['$scope', '$location', '$routeParams', 'breadcrumbService', 'userService', 'projectService', 'sessionService', 'silNoticeService', 'messageService',
                                 function($scope, $location, $routeParams, breadcrumbService, userService, projectService, ss, notice, messageService) {
	$scope.userFilter = '';
	$scope.message = {};
	$scope.newMessageCollapsed = true;

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
	
	$scope.removeProjectUsers = function() {
//		console.log("removeUsers");
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
//		console.log('userchange...', model);
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
//		console.log('searching for ', userName);
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
					$scope.queryProjectSettings();
				};
			});
		} else if ($scope.addMode == 'addExisting') {
			var model = {};
			model.id = $scope.user.id;
			projectService.updateUser($scope.project.id, model, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "'" + $scope.user.name + "' was added to " + $scope.project.projectname + " successfully");
					$scope.queryProjectSettings();
				}
			});
		} else if ($scope.addMode == 'invite') {
			userService.sendInvite($scope.typeahead.userName, $scope.project.id, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "'" + $scope.typeahead.userName + "' was invited to join the project " + $scope.project.projectname);
					$scope.queryProjectSettings();
				}
			});
		}
	};

	$scope.selectUser = function(item) {
//		console.log('user selected', item);
		$scope.user = item;
		$scope.typeahead.userName = item.name;
		$scope.updateAddMode('addExisting');
	};

	$scope.imageSource = function(avatarRef) {
		return avatarRef ? '/images/shared/avatar/' + avatarRef : '/images/shared/avatar/anonymous02.png';
	};

}])
;
