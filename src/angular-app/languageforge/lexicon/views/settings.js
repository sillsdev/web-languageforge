'use strict';

angular.module('lexicon.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
  'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
  'palaso.ui.textdrop'])
  .controller('SettingsCtrl', ['$scope', '$filter', 'userService', 'sessionService',
    'silNoticeService', 'lexProjectService',
  function ($scope, $filter, userService, ss,
            notice, lexProjectService) {
    // lexProjectService.setBreadcrumbs('settings', $filter('translate')('Project Settings'));

    ss.getSession().then(function(session) {
      $scope.rights.archive = (!session.project().isArchived &&
        (session.project().userIsProjectOwner ||
        session.hasSiteRight(ss.domain.PROJECTS, ss.operation.ARCHIVE)));
      $scope.rights.remove = session.project().userIsProjectOwner ||
        session.hasSiteRight(ss.domain.PROJECTS, ss.operation.DELETE);
    })

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
