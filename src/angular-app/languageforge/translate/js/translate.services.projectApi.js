'use strict';

angular.module('translate.services')
  .service('translateProjectApi',
    ['apiService', 'sessionService', 'projectService',
  function (api, sessionService, projectService) {
    angular.extend(this, projectService);

    this.updateProject = api.method('translate_projectUpdate');
    this.readProject = api.method('translate_projectDto');
    this.updateConfig = api.method('translate_configUpdate');
    this.updateUserPreferences = api.method('translate_configUpdateUserPreferences');
    this.users = api.method('project_usersDto');
    this.updateUserProfile = api.method('user_updateProfile');

    this.getProjectId = sessionService.projectId;

    this.isValidProjectCode = function isValidProjectCode(code) {
      if (angular.isUndefined(code)) return false;

      // Valid project codes start with a letter and only contain lower-case letters, numbers,
      // dashes and underscores
      var pattern = /^[a-z][a-z0-9\-_]*$/;
      return pattern.test(code);
    };
  }])

  ;
