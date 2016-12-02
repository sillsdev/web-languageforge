'use strict';

angular.module('palaso.ui.deleteProject', ['bellows.services'])
  .directive('puiDeleteProject', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/pui-delete-project.html',
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
              var projectIds = [ss.session.project.id];
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
        }]
    };
  }])

;
