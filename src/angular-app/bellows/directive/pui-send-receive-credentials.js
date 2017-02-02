'use strict';

angular.module('palaso.ui.sendReceiveCredentials', [])
  .directive('puiSendReceiveCredentials', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/pui-send-receive-credentials.html',
      scope: {
        puiProject: '=',
        puiValidate: '&',
        puiReset: '&',
        puiInitialCheck: '='
      },
      controller: ['$scope', 'lexSendReceiveApi', function ($scope, sendReceiveApi) {
        $scope.checkSRProject = function checkSRProject() {
          $scope.puiProject.sendReceive.credentialsStatus = 'loading';
          sendReceiveApi.getUserProjects($scope.puiProject.sendReceive.username,
            $scope.puiProject.sendReceive.password,
            function (result) {
              $scope.puiProject.sendReceive.isUnchecked = false;
              $scope.puiProject.sendReceive.projects = result.data.projects;
              if (result.ok) {
                if(result.data.hasValidCredentials) {
                  $scope.puiProject.sendReceive.credentialsStatus = 'valid';
                }
                else {
                  $scope.puiProject.sendReceive.credentialsStatus = 'invalid';
                }
              } else {
                $scope.puiProject.sendReceive.credentialsStatus = 'failed';
              }
            }
          );
        };

        if (angular.isDefined($scope.puiInitialCheck) && $scope.puiInitialCheck) {
          $scope.checkSRProject();
        }

        $scope.projectOption = function projectOption(project) {
          if (!project) {
            return '';
          }

          var option = project.name + ' (' + project.identifier;
          if (project.repoClarification) option += ', ' + project.repoClarification;
          if (project.role != 'unknown') option += ', ' + project.role;
          option +=  ')';
          return option;
        };

        $scope.showProjectSelect = function showProjectSelect() {
          var show = $scope.puiProject.sendReceive.credentialsStatus === 'valid';
          if (show && angular.isDefined($scope.puiProject.sendReceive.project) &&
            angular.isDefined($scope.puiProject.sendReceive.project.identifier) &&
            angular.isDefined($scope.puiProject.sendReceive.projects)) {
            angular.forEach($scope.puiProject.sendReceive.projects, function (project, index) {
              if (project.identifier == $scope.puiProject.sendReceive.project.identifier &&
                project.repository == $scope.puiProject.sendReceive.project.repository) {
                $scope.projectsIndex = index;
              }
            });
          }

          return show;
        };
      }]
    };
  }])

  ;
