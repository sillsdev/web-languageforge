'use strict';

angular.module('translate.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
  'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
  'palaso.ui.textdrop'])
  .config(['$stateProvider', function ($stateProvider) {
    // TODO: remove dependency on bootstrap JS and jquery calls in the state provider below.
    // Use UI-bootstrap instead

    // State machine from ui.router
    $stateProvider
      .state('settings-project', {
        url: '/settings-project',
        templateUrl: '/angular-app/languageforge/translate/views/settings.html',
        controller: function () {
          jQuery("#app-container-for-bootstrap .nav-tabs a[href='#settings-project']").tab('show');
        }
      })
      .state('settings-archive', {
        url: '/settings-archive',
        templateUrl: '/angular-app/languageforge/translate/views/settings.html',
        controller: function () {
          jQuery("#app-container-for-bootstrap .nav-tabs a[href='#settings-archive']").tab('show');
        }
      })
      .state('settings-delete', {
        url: '/settings-delete',
        templateUrl: '/angular-app/languageforge/translate/views/settings.html',
        controller: function () {
          jQuery("#app-container-for-bootstrap .nav-tabs a[href='#settings-delete']").tab('show');
        }
      })
    ;

  }])
  .controller('SettingsCtrl', ['$scope', '$filter', 'userService', 'sessionService',
    'silNoticeService', 'translateProjectService',
  function ($scope, $filter, userService, sessionService,
            notice, projectService) {
    $scope.project = $scope.project || {};
    $scope.actionInProgress = false;

    $scope.rights = {};
    $scope.rights.archive = (!sessionService.session.project.isArchived &&
      (sessionService.session.project.userIsProjectOwner ||
      sessionService.hasSiteRight(sessionService.domain.PROJECTS,
        sessionService.operation.ARCHIVE)));
    $scope.rights.remove = sessionService.session.project.userIsProjectOwner ||
      sessionService.hasSiteRight(sessionService.domain.PROJECTS, sessionService.operation.DELETE);

    readProject();

    function readProject() {
      projectService.readProject(function (result) {
        if (result.ok) {
          angular.merge($scope.project, result.data.project);
        }
      });
    }

    $scope.updateProject = function () {
      var settings = {
        projectName: $scope.project.projectName,
        interfaceLanguageCode: $scope.project.interfaceLanguageCode,
        featured: $scope.project.featured
      };

      projectService.updateProject(settings, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS,
            $scope.project.projectName + ' settings updated successfully.');
        }
      });
    };

  }])

  ;
