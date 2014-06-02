'use strict';

// Services
// ScriptureForge common services
angular.module('bellows.services', ['jsonRpc'])
.service('userService', ['jsonRpc', function(jsonRpc) {
	jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
	this.read = function(id, callback) {
		jsonRpc.call('user_read', [id], callback);
	};
	this.readProfile = function(callback) {
		jsonRpc.call('user_readProfile', [], callback);
	};
	this.update = function(model, callback) {
		jsonRpc.call('user_update', [model], callback);
	};
	this.updateProfile = function(model, callback) {
		jsonRpc.call('user_updateProfile', [model], callback);
	};
	this.remove = function(userIds, callback) {
		jsonRpc.call('user_delete', [userIds], callback);
	};
	this.createSimple = function(userName, projectId, callback) {
		jsonRpc.call('user_createSimple', [projectId, userName], callback);
	};
	this.list = function(callback) {
		// TODO Paging CP 2013-07
		jsonRpc.call('user_list', [], callback);
	};
	this.typeahead = function(term, callback) {
		jsonRpc.call('user_typeahead', [term], callback);
	};
	this.changePassword = function(userId, newPassword, callback) {
		jsonRpc.call('change_password', [userId, newPassword], callback);
	};
	this.userNameExists = function(username, callback) {
		jsonRpc.call('username_exists', [username], callback);
	};
	this.create = function(model, callback) {
		jsonRpc.call('user_create', [model], callback);
	};
	this.register = function(model, callback) {
		jsonRpc.call('user_register', [model], callback);
	};
	this.readForRegistration = function(validationKey, callback) {
		jsonRpc.call('user_readForRegistration', [validationKey], callback);
	};
	this.updateFromRegistration = function(validationKey, model, callback) {
		jsonRpc.call('user_updateFromRegistration', [validationKey, model], callback);
	};
	this.sendInvite = function(toEmail, projectId, callback) {
		jsonRpc.call('user_sendInvite', [projectId, toEmail], callback);
	};
	
}])
.service('projectService', ['jsonRpc', function(jsonRpc) {
	jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
	this.create = function(projectName, appName, callback) {
		jsonRpc.call('project_create', [projectName, appName], callback);
	};
	this.remove = function(projectIds, callback) {
		jsonRpc.call('project_delete', [projectIds], callback);
	};
	this.list = function(callback) {
		jsonRpc.call('project_list_dto', [], callback);
	};
	this.users = function(projectId, callback) {
		jsonRpc.call('project_usersDto', [projectId], callback);
	};
	this.readUser = function(projectId, userId, callback) {
		jsonRpc.call('project_readUser', [projectId, userId], callback);
	};
	this.updateUser = function(projectId, model, callback) {
		jsonRpc.call('project_updateUserRole', [projectId, model], callback);
	};
	this.removeUsers = function(projectId, users, callback) {
		jsonRpc.call('project_removeUsers', [projectId, users], callback);
	};
	
}])
.service('activityPageService', ['jsonRpc', function(jsonRpc) {
	jsonRpc.connect('/api/sf');
	this.list_activity = function(offset, count, callback) {
		jsonRpc.call('activity_list_dto', [offset, count], callback);
	};
	
}])
.service('sessionService', ['jsonRpc', '$window', function(jsonRpc, $window) {
	this.currentUserId = function() {
		return $window.session.userId;
	};
	
	this.fileSizeMax = function() {
		return $window.session.fileSizeMax;
	};
	
	this.site = function() {
		return $window.session.site;
	};
	
	this.realm = {
		SITE: function() { return $window.session.userSiteRights; }
	};
	this.domain = {
			ANY:       function() { return 1000;},
			USERS:     function() { return 1100;},
			PROJECTS:  function() { return 1200;},
			TEXTS:     function() { return 1300;},
			QUESTIONS: function() { return 1400;},
			ANSWERS:   function() { return 1500;},
			COMMENTS:  function() { return 1600;},
			TEMPLATES: function() { return 1700;},
			TAGS:      function() { return 1800;}
	};
	this.operation = {
			CREATE:       function() { return 1;},
			EDIT:         function() { return 2;},
			DELETE:       function() { return 3;},
			LOCK:         function() { return 4;},
			VIEW:         function() { return 5;},
			VIEW_OWN:     function() { return 6;},
			EDIT_OWN:     function() { return 7;},
			DELETE_OWN:   function() { return 8;},
	};
	
	this.hasRight = function(rights, domain, operation) {
		if (rights) {
			var right = domain() + operation();
			return rights.indexOf(right) != -1;
		}
		return false;
	};
	
	this.session = function() {
		return $window.session;
	};
	
	this.getCaptchaSrc = function(callback) {
		jsonRpc.call('get_captcha_src', [], callback);
	};
	
}])
.service('sfchecksLinkService', function() {
	this.href = function(url, text) {
		return '<a href="' + url + '">' + text + '</a>';
	};
	
	this.project = function(projectId) {
		return '/app/sfchecks#/p/' + projectId;
	};
	
	this.text = function(projectId, textId) {
		return this.project(projectId) + "/" + textId;
	};
	
	this.question = function(projectId, textId, questionId) {
		return this.text(projectId, textId) + "/" + questionId;
	};
	
	this.user = function(userId) {
		return '/app/userprofile/' + userId;
	};
	
})
.service('modalService', ['$modal', function ($modal) {
	// Taken from http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
	var modalDefaults = {
		backdrop: true,
		keyboard: true,
		modalFade: true,
		templateUrl: '/angular-app/bellows/js/modal.html'

	};
	
	var modalOptions = {
		closeButtonText: 'Close',
		actionButtonText: 'OK',
		headerText: 'Proceed?',
		bodyText: 'Perform this action?'
	};
	
	this.showModal = function (customModalDefaults, customModalOptions) {
		if (!customModalDefaults) customModalDefaults = {};
		customModalDefaults.backdrop = 'static';
		return this.show(customModalDefaults, customModalOptions);
	};
	
	this.show = function (customModalDefaults, customModalOptions) {
		// Create temp objects to work with since we're in a singleton service
		var tempModalDefaults = {};
		var tempModalOptions = {};
		
		// Map angular-ui modal custom defaults to modal defaults defined in service
		angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
		
		// Map modal.html $scope custom properties to defaults defined in service
		angular.extend(tempModalOptions, modalOptions, customModalOptions);
		
		if (!tempModalDefaults.controller) {
			tempModalDefaults.controller = function ($scope, $modalInstance) {
				$scope.modalOptions = tempModalOptions;
				$scope.modalOptions.ok = function (result) {
					$modalInstance.close(result);
				};
				$scope.modalOptions.close = function (result) {
					$modalInstance.dismiss('cancel');
				};
			};
		}
		
		return $modal.open(tempModalDefaults).result;
	};
	
}])
;
