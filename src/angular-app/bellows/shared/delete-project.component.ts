'use strict';

angular.module('palaso.ui.deleteProject', ['coreModule'])
  .directive('puiDeleteProject', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/shared/delete-project.component.html',
      controller: ['$scope', 'projectService', 'sessionService',
        'silNoticeService', 'modalService', '$window',
        function ($scope, projectService, ss, notice, modalService, $window) {

          $scope.actionInProgress = false;

          // Delete the project
          $scope.deleteProject = function () {
            var message = 'Are you sure you want to delete this project?\n' +
              'This is a permanent action and cannot be restored.';
            var modalOptions = {
              closeButtonText: 'Cancel',
              actionButtonText: 'Delete',
              headerText: 'Permanently delete project?',
              bodyText: message
            };
            modalService.showModal({}, modalOptions).then(function () {
              ss.getSession().then(function (session) {
                var projectIds = [session.project().id];
                $scope.actionInProgress = true;
                projectService.deleteProject(projectIds).then(function () {
                  notice.push(notice.SUCCESS, 'The project was permanently deleted');
                  $window.location.href = '/app/projects';
                }).catch(function () {
                  $scope.actionInProgress = false;
                });
              });
            }, angular.noop);
          };
        }]
    };
  }])

  ;
