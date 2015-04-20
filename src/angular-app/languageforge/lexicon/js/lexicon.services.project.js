'use strict';

angular.module('lexicon.services')

// Lexicon Project Service
.service('lexProjectService', ['jsonRpc', 'sessionService', 'breadcrumbService', 'lexLinkService', '$location', 
function(jsonRpc, ss, breadcrumbService, linkService, $location) {
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
    jsonRpc.call('lex_baseViewDto', [], function(result) {
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
    // var parts = $location.path().split('/');
    // // strip off the "/p/"
    // return parts[2];
  };
}])
;
