'use strict';

angular.module('projectmanagement', ['projectManagement.services', 'bellows.services',
  'palaso.ui.listview', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.utils', 'wc.Directives'])
  .controller('ProjectManagementCtrl', ['$scope', 'projectService', 'projectManagementService',
    'sessionService', 'silNoticeService', 'modalService', '$window',
    function ($scope, projectService, appService, ss, notice, modalService, $window) {

      $scope.project = ss.session.project;
      $scope.actionInProgress = false;

      // Rights
      $scope.rights = {};
      $scope.rights.archive = (!ss.session.project.isArchived &&
        (ss.session.project.userIsProjectOwner ||
        ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.ARCHIVE)));
      $scope.rights.remove = ss.session.project.userIsProjectOwner ||
          ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.DELETE);

      $scope.report = {
        output: '',
        currentId: ''
      };
      $scope.reportOutput = '';

      $scope.loadDto = function loadDto() {
        appService.getDto(function (result) {
          if (result.ok) {
            $scope.reports = result.data.reports;
            $scope.dtoLoaded = true;
          }
        });
      };

      $scope.loadDto();

      $scope.$watch('report.currentId', function () {
        $scope.runReport();
      });

      $scope.runReport = function runReport() {
        if ($scope.report.currentId) {
          $scope.report.output = 'Running Report...';
          appService.runReport($scope.report.currentId, [], function (result) {
            if (result.ok) {
              $scope.report.output = result.data.output.replace(/\\n/g, "\n"); // jscs:ignore
            }
          });
        } else {
          $scope.report.output = '';
        }
      };

      // Archive the project
      $scope.archiveProject = function () {
        var message = 'Are you sure you want to archive this project?';
        var modalOptions = {
          closeButtonText: 'Cancel',
          actionButtonText: 'Archive',
          headerText: 'Archive Project?',
          bodyText: message
        };
        modalService.showModal({}, modalOptions).then(function () {
          $scope.actionInProgress = true;
          projectService.archive(function (result) {
            if (result.ok) {
              notice.push(notice.SUCCESS, 'The project was archived successfully');
              $window.location.href = '/app/projects';
            } else {
              $scope.actionInProgress = false;
            }
          });
        });
      };

      // Delete the project
      $scope.deleteProject = function() {
        var message = 'Are you sure you want to delete this project?\n' +
            'This is a permanent action and cannot be restored.';
        var modalOptions = {
          closeButtonText: 'Cancel',
          actionButtonText: 'Delete',
          headerText: 'Permanently delete project?',
          bodyText: message
        };
        modalService.showModal({}, modalOptions).then(function () {
          var projectIds = [];
          projectIds.push($scope.project.id);
          $scope.actionInProgress = true;
          projectService.remove(projectIds, function (result) {
            if (result.ok) {
              notice.push(notice.SUCCESS, 'The project was permanently deleted');
              $window.location.href = '/app/projects';
            } else {
              $scope.actionInProgress = false;
            }
          });
        });
      };
    }
  ]);
