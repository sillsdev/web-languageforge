'use strict';

angular.module('lexicon.services')
  .service('lexProjectService', ['apiService', 'sessionService', 'breadcrumbService', 'lexLinkService',
  function (api, ss, breadcrumbService, linkService) {

    this.setBreadcrumbs = function setBreadcrumbs(view, label) {
      breadcrumbService.set('top', [{
        href: '/app/projects',
        label: 'My Projects'
      }, {
        href: linkService.projectUrl(),
        label: ss.session.project.projectName
      }, {
        href: linkService.projectView(view),
        label: label
      }]);
    };

    this.baseViewDto = function baseViewDto(view, label, callback) {
      var setBreadcrumbs = this.setBreadcrumbs;
      api.call('lex_baseViewDto', [], function (result) {
        if (result.ok) {
          setBreadcrumbs(view, label);
        }

        callback(result);
      });
    };

    this.updateConfiguration = api.method('lex_configuration_update');
    this.updateOptionList = api.method('lex_optionlist_update');
    this.readProject = api.method('lex_projectDto');
    this.updateProject = api.method('lex_project_update');
    this.updateSettings = api.method('project_updateSettings');
    this.readSettings = api.method('project_readSettings');
    this.users = api.method('project_usersDto');
    this.updateUserProfile = api.method('user_updateProfile');
    this.removeMediaFile = api.method('lex_project_removeMediaFile');

    this.isValidProjectCode = function isValidProjectCode(code) {
      if (angular.isUndefined(code)) return false;

      // Valid project codes start with a letter and only contain lower-case letters, numbers,
      // dashes and underscores
      var pattern = /^[a-z][a-z0-9\-_]*$/;
      return pattern.test(code);
    };
  }])

  ;
