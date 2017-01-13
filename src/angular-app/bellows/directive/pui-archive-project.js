'use strict';

angular.module('palaso.ui.archiveProject', ['bellows.services'])
  .directive('puiArchiveProject', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/pui-archive-project.html',
      scope: {
        puiActionInProgress: '='
      },
      controller: ['$scope', 'projectService', 'sessionService',
        'silNoticeService', 'modalService', '$window',
        function ($scope, projectService, ss, notice, modalService, $window) {

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
              $scope.puiActionInProgress = true;
              projectService.archiveProject(function (result) {
                if (result.ok) {
                  notice.push(notice.SUCCESS, 'The project was archived successfully');
                  $window.location.href = '/app/projects';
                } else {
                  $scope.puiActionInProgress = false;
                }
              });
            });
          };
        }]
    };
  }])

;
