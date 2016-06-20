'use strict';

angular.module('lexicon.services')
  .service('lexProjectService', ['jsonRpc', 'sessionService', 'breadcrumbService', 'lexLinkService',
  function (jsonRpc, ss, breadcrumbService, linkService) {
    jsonRpc.connect('/api/sf');

    this.setBreadcrumbs = function setBreadcrumbs(view, label) {
      breadcrumbService.set('top', [{
        href: '/app/projects',
        label: 'My Projects'
      }, {
        href: linkService.project(),
        label: ss.session.project.projectName
      }, {
        href: linkService.projectView(view),
        label: label
      }]);
    };

    this.baseViewDto = function baseViewDto(view, label, callback) {
      var setBreadcrumbs = this.setBreadcrumbs;
      jsonRpc.call('lex_baseViewDto', [], function (result) {
        if (result.ok) {
          setBreadcrumbs(view, label);
        }

        callback(result);
      });
    };

    this.updateConfiguration = function updateConfiguration(config, optionlist, callback) {
      jsonRpc.call('lex_configuration_update', [config, optionlist], callback);
    };

    this.updateOptionList = function updateOptionList(optionList, callback) {
      jsonRpc.call('lex_optionlist_update', [optionList], callback);
    };

    this.readProject = function readProject(callback) {
      jsonRpc.call('lex_projectDto', [], callback);
    };

    this.updateProject = function updateProject(project, callback) {
      jsonRpc.call('lex_project_update', [project], callback);
    };

    this.updateSettings = function updateSettings(smsSettings, emailSettings, callback) {
      jsonRpc.call('project_updateSettings', [smsSettings, emailSettings], callback);
    };

    this.readSettings = function readSettings(callback) {
      jsonRpc.call('project_readSettings', [], callback);
    };

    this.users = function users(callback) {
      jsonRpc.call('project_usersDto', [], callback);
    };

    this.updateUserProfile = function updateUserProfile(user, callback) {
      jsonRpc.call('user_updateProfile', [user], callback);
    };

    this.removeMediaFile = function removeMediaFile(mediaType, fileName, callback) {
      jsonRpc.call('lex_project_removeMediaFile', [mediaType, fileName], callback);
    };

    this.getProjectId = function getProjectId() {
      return ss.session.project.id;
    };

    this.hasSendReceive = function hasSendReceive() {
      return ss.session.projectSettings.hasSendReceive;
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
