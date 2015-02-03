'use strict';

// Common Services
angular.module('bellows.services', ['jsonRpc'])
.service('userService', ['jsonRpc', function(jsonRpc) {
  // Note this doesn't actually 'connect', it simply sets the connection url.
  jsonRpc.connect('/api/sf');
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
  this.createSimple = function(userName, callback) {
    jsonRpc.call('user_createSimple', [userName], callback);
  };
  this.list = function(callback) {
    // TODO Paging CP 2013-07
    jsonRpc.call('user_list', [], callback);
  };
  this.typeahead = function(term, callback) {
    jsonRpc.call('user_typeahead', [term], callback);
  };
  this.typeaheadExclusive = function(term, projectIdToExclude, callback) {
    // projectIdToExclude's default value if not specified: '' (empty string)
    if (typeof callback === 'undefined') {
      // If called with just two parameters, this was typeahead(term, callback)
      callback = projectIdToExclude;
      projectIdToExclude = '';
    }
    jsonRpc.call('user_typeaheadExclusive', [term, projectIdToExclude], callback);
  };
  this.changePassword = function(userId, newPassword, callback) {
    jsonRpc.call('change_password', [userId, newPassword], callback);
  };
  this.identityCheck = function(username, email, callback) {
    jsonRpc.call('identity_check', [username, email], callback);
  };
  this.checkUniqueIdentity = function(userId, updatedUsername, updatedEmail, callback) {
    jsonRpc.call('check_unique_identity', [userId, updatedUsername, updatedEmail], callback);
  };
  this.activate = function(username, password, email, callback) {
    jsonRpc.call('user_activate', [username, password, email], callback);
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
  this.sendInvite = function(toEmail, callback) {
    jsonRpc.call('user_sendInvite', [toEmail], callback);
  };

}])
.service('projectService', ['jsonRpc', 'sessionService', function(jsonRpc, ss) {
  jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
  this.create = function(projectName, projectCode, appName, callback) {
    jsonRpc.call('project_create', [projectName, projectCode, appName], callback);
  };
  this.archive = function(projectIds, callback) {
    jsonRpc.call('project_archive', [projectIds], callback);
  };
  this.archivedList = function(callback) {
    jsonRpc.call('project_archivedList', [], callback);
  };
  this.publish = function(projectIds, callback) {
    jsonRpc.call('project_publish', [projectIds], callback);
  };
  this.list = function(callback) {
    jsonRpc.call('project_list_dto', [], callback);
  };
  this.users = function(callback) {
    jsonRpc.call('project_usersDto', [], callback);
  };
  this.readUser = function(userId, callback) {
    jsonRpc.call('project_readUser', [userId], callback);
  };
  this.updateUserRole = function(userId, role, callback) {
    jsonRpc.call('project_updateUserRole', [userId, role], callback);
  };
  this.getOwner = function(projectId, callback) {
    jsonRpc.call('project_getOwner', [projectId], callback);
  };
  this.removeUsers = function(users, callback) {
    jsonRpc.call('project_removeUsers', [users], callback);
  };
  this.projectCodeExists = function(projectCode, callback) {
    jsonRpc.call('projectcode_exists', [projectCode], callback);
  };
  this.joinProject = function(projectId, role, callback) {
    jsonRpc.call('project_joinProject', [projectId, role], callback);
  };

  // data constants
  this.data = {};
  this.data.projectTypeNames = {
    'sfchecks': 'Community Scripture Checking',
    'rapuma': 'Publishing',
    'lexicon': 'Web Dictionary'
  };
  this.data.projectTypesBySite = function() {
    var types = {
      'scriptureforge': ['sfchecks'],
      'languageforge': ['lexicon']
    };
    return types[ss.baseSite()];
  };

}])
.service('activityPageService', ['jsonRpc', function(jsonRpc) {
  jsonRpc.connect('/api/sf');
  this.list_activity = function(offset, count, callback) {
    jsonRpc.call('activity_list_dto', [offset, count], callback);
  };

}])
.service('sessionService', ['jsonRpc', '$window', function(jsonRpc, $window) {
    var privateData = angular.copy($window.session);

  this.currentUserId = function() {
    return $window.session.userId;
  };

  this.fileSizeMax = function() {
    return $window.session.fileSizeMax;
  };

  this.baseSite = function() {
    return $window.session.baseSite;
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
      TAGS:      function() { return 1800;},
      ENTRIES:   function() { return 1900;}
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
      ARCHIVE:      function() { return 9;}
  };

  this.hasSiteRight = function(domain, operation) {
    return this.hasRight($window.session.userSiteRights, domain, operation);
  };

  this.hasProjectRight = function(domain, operation) {
    return this.hasRight($window.session.userProjectRights, domain, operation);
  };

  this.hasRight = function(rights, domain, operation) {
    if (rights) {
      var right = domain() + operation();
      return rights.indexOf(right) != -1;
    }
    return false;
  };

  this.getSetting = function(settings, key) {
    if (settings) {
      return settings[key];
    } else {
      return null; // Or undefined? Or false?
    }
  };
  this.getProjectSetting = function(key) {
    return this.getSetting($window.session.projectSettings, key);
  };

  this.session = $window.session;

  this.getCaptchaSrc = function(callback) {
    jsonRpc.call('get_captcha_src', [], callback);
  };

  this.refresh = function(callback) {
        var ref = this;
    jsonRpc.connect('/api/sf');
    jsonRpc.call('session_getSessionData', [], function(result) {
            ref.session = result.data;
            /*
            angular.forEach(result.data, function(value, key) {
               ref.session[key] = value;
            });
            */
      (callback || angular.noop)();
    });
  };

}])
.service('sfchecksLinkService', function() {
  this.href = function(url, text) {
    return '<a href="' + url + '">' + text + '</a>';
  };

  this.project = function(projectId, projectType) {
    projectType = projectType || 'sfchecks';
    if (angular.isDefined(projectId)) {
      return '/app/' + projectType + '/' + projectId + '/#';
    } else {
      return '#';
    };
  };

  this.text = function(textId, projectId) {
    if (angular.isDefined(projectId)) {
      return this.project(projectId) + "/" + textId;
    } else {
      return this.project() + "/" + textId;
    };
  };

  this.question = function(textId, questionId, projectId) {
    if (angular.isDefined(projectId)) {
      return this.text(textId, projectId) + "/" + questionId;
    } else {
      return this.text(textId) + "/" + questionId;
    };
  };

  this.entry = function(entryId, projectId) {
    if (angular.isDefined(projectId)) {
      // TODO: Replace hardcoded 'lexicon' below
      return this.project(projectId, 'lexicon') + '/dbe/' + entryId;
    } else {
      return '#/dbe/' + entryId;
    };
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

    this.showModalSimple = function showModalSimple(headerText, messageText, closeButtonText, actionButtonText) {
        var opts = {
            headerText: headerText,
            bodyText: messageText
        };
        if (closeButtonText) opts.closeButtonText = closeButtonText;
        if (actionButtonText) opts.actionButtonText = actionButtonText;
        return this.showModal({}, opts);
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
      tempModalDefaults.controller = ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.modalOptions = tempModalOptions;
        $scope.modalOptions.ok = function (result) {
          $modalInstance.close(result);
        };
        $scope.modalOptions.close = function (result) {
          $modalInstance.dismiss('cancel');
        };
      }];
    }

    return $modal.open(tempModalDefaults).result;
  };

}])
.service('utilService', function() {
  this.uuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  };
});
