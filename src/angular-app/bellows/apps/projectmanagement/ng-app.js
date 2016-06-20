'use strict';

angular.module('projectmanagement', ['projectManagement.services', 'bellows.services', 'palaso.ui.listview', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.utils', 'wc.Directives'])
  .controller('ProjectManagementCtrl', ['$scope', 'projectService', 'projectManagementService', 'sessionService', 'silNoticeService', 'modalService', '$window',
    function($scope, projectService, appService, ss, notice, modalService, $window) {

      $scope.project = ss.session.project;
      $scope.actionInProgress = false;
      $scope.report = {
        output: '',
        currentId: ''
      };
      $scope.reportOutput = '';

      $scope.loadDto = function loadDto() {
        appService.getDto(function(result) {
          if (result.ok) {
            $scope.reports = result.data.reports;
            $scope.dtoLoaded = true;
          }
        });
      };
      $scope.loadDto();

      $scope.$watch('report.currentId', function(reportId) {
        $scope.runReport();
      });

      $scope.runReport = function runReport() {
        if ($scope.report.currentId) {
          $scope.report.output = 'Running Report...';
          appService.runReport($scope.report.currentId, [], function(result) {
            if (result.ok) {
              $scope.report.output = result.data.output.replace(/\\n/g,"\n");
            }
          });
        } else {
          $scope.report.output = '';
        }
      };

      // Archive the project
      $scope.archiveProject = function() {
        var message = "Are you sure you want to archive this project?";
        var modalOptions = {
          closeButtonText: 'Cancel',
          actionButtonText: 'Archive',
          headerText: 'Archive Project?',
          bodyText: message
        };
        modalService.showModal({}, modalOptions).then(function (result) {
          $scope.actionInProgress = true;
          var archiveFunction;
          if (ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.ARCHIVE)) {
            archiveFunction = projectService.archiveAsAdmin;
          } else {
            archiveFunction = appService.archiveProjectAsOwner;
          }
          archiveFunction(function(result) {
            if (result.ok) {
              notice.push(notice.SUCCESS, "The project was archived successfully");
              $window.location.href = '/app/projects';
            } else {
              $scope.actionInProgress = false;
            }
          });
        });
      };


    }])
;
