'use strict';

angular.module('palaso.ui.runReport', ['bellows.services'])
  .directive('puiRunReport', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/pui-run-report.html',
      scope: {},
      controller: ['$scope', 'projectService',
        function ($scope, projectService) {
          $scope.report = {
            output: '',
            currentId: ''
          };
          $scope.reportOutput = '';

          $scope.loadDto = function loadDto() {
            projectService.getDto(function (result) {
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
              projectService.runReport($scope.report.currentId, [], function (result) {
                if (result.ok) {
                  $scope.report.output = result.data.output.replace(/\\n/g, "\n"); // jscs:ignore
                }
              });
            } else {
              $scope.report.output = '';
            }
          };
        }]
    };
  }])

;
