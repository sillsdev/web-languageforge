'use strict';

angular.module('translate.services')
  .service('translateProjectService',
    ['jsonRpc', 'sessionService', 'projectService',
  function (jsonRpc, sessionService, projectService) {
    jsonRpc.connect('/api/sf');

    angular.extend(this, projectService);

    this.readProject = function readProject(callback) {
      jsonRpc.call('translate_projectDto', [], callback);
    };

    this.updateProject = function updateProject(project, callback) {
      jsonRpc.call('translate_projectUpdate', [project], callback);
    };

    this.users = function users(callback) {
      jsonRpc.call('project_usersDto', [], callback);
    };

    this.updateUserProfile = function updateUserProfile(user, callback) {
      jsonRpc.call('user_updateProfile', [user], callback);
    };

    this.getProjectId = function getProjectId() {
      return sessionService.session.project.id;
    };

    this.isValidProjectCode = function isValidProjectCode(code) {
      if (angular.isUndefined(code)) return false;

      // Valid project codes start with a letter and only contain lower-case letters, numbers,
      // dashes and underscores
      var pattern = /^[a-z][a-z0-9\-_]*$/;
      return pattern.test(code);
    };
  }])

  ;
