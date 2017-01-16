'use strict';

angular.module('lexicon.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
  'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
  'palaso.ui.textdrop'])
  .controller('SettingsCtrl', ['$scope', '$filter', 'userService', 'sessionService',
    'silNoticeService', 'lexProjectService',
  function ($scope, $filter, userService, sessionService,
            notice, lexProjectService) {
    // lexProjectService.setBreadcrumbs('settings', $filter('translate')('Project Settings'));

    $scope.rights.archive = (!sessionService.session.project.isArchived &&
      (sessionService.session.project.userIsProjectOwner ||
      sessionService.hasSiteRight(sessionService.domain.PROJECTS,
        sessionService.operation.ARCHIVE)));
    $scope.rights.remove = sessionService.session.project.userIsProjectOwner ||
      sessionService.hasSiteRight(sessionService.domain.PROJECTS, sessionService.operation.DELETE);

    readProject();

    $scope.project = $scope.project || {};
    $scope.actionInProgress = false;

    function readProject() {
      lexProjectService.readProject(function (result) {
        if (result.ok) {
          $.extend($scope.project, result.data.project);
        }
      });
    }

    $scope.updateProject = function () {
      var settings = {
        projectName: $scope.project.projectName,
        interfaceLanguageCode: $scope.project.interfaceLanguageCode,
        featured: $scope.project.featured
      };

      lexProjectService.updateProject(settings, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS,
            $scope.project.projectName + ' settings updated successfully.');
        }
      });
    };

  }])

  ;
