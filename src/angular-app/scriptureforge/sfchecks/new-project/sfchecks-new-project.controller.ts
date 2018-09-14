import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {JsonRpcResult} from '../../../bellows/core/api/json-rpc.service';
import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {ListViewModule} from '../../../bellows/shared/list-view.component';
import {PuiUtilityModule} from '../../../bellows/shared/utils/pui-utils.module';

export const SfChecksNewProjectModule = angular
  .module('sfchecks-new-project', [
    'ui.bootstrap',
    uiRouter,
    CoreModule,
    ListViewModule,
    NoticeModule,
    PuiUtilityModule
  ])
  .config(['$stateProvider', '$urlRouterProvider',
    ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
      // State machine from ui.router
      $stateProvider
        .state('newProject', {
          abstract: true,
          templateUrl:
            '/angular-app/scriptureforge/sfchecks/new-project/views/new-project-abstract.html',
          controller: 'NewSfchecksProjectCtrl'
        })
        .state('newProject.name', {
          templateUrl:
            '/angular-app/scriptureforge/sfchecks/new-project/views/new-project-name.html',
          data: {
            step: 1
          }
        })
        ;

      $urlRouterProvider
        .when('', ['$state', ($state: angular.ui.IStateService | any) => {
          if (!$state.$current.navigable) {
            $state.go('newProject.name');
          }
        }]);
    }
  ])
  .controller('NewSfchecksProjectCtrl', ['$scope', 'projectService',
    'silNoticeService', '$window', 'linkService',
    ($scope, projectService, notice, $window, linkService) => {
      $scope.newProject = {};

      // Add new project
      $scope.addProject = function addProject(): void {
        if ($scope.projectCodeState === 'ok') {
          $scope.isSubmitting = true;
          projectService.create($scope.newProject.projectName, $scope.newProject.projectCode, 'sfchecks', {})
            .then((result: JsonRpcResult) => {
              if (result.ok) {
                notice.push(notice.SUCCESS, 'The ' + $scope.newProject.projectName +
                  ' project was created successfully');

                // redirect to new project settings page
                $window.location.href = linkService.project(result.data);
              } else {
                $scope.isSubmitting = false;
              }
            }
          );
        } else {
          $scope.checkProjectCode();
        }
      };

      function projectNameToCode(name: string): string {
        if (name == null) {
          return undefined;
        }

        return 'sfchecks-' + name.toLowerCase().replace(/ /g, '_');
      }

      function isValidProjectCode(code: string): boolean {
        if (code == null) {
          return false;
        }

        // Valid project codes start with a letter and only contain lower-case letters, numbers, dashes and underscores
        const pattern = /^[a-z][a-z0-9\-_]*$/;
        return pattern.test(code);
      }

      $scope.$watch('newProject.projectName', (newValue: string) => {
        if (!$scope.newProject.editProjectCode) {
          if (newValue == null) {
            $scope.newProject.projectCode = '';
          } else {
            $scope.newProject.projectCode = projectNameToCode(newValue);
          }
        }
      });

      /*
       // State of the projectCode being validated:
       // 'loading' : project code entered, being validated
       // 'exist'   : project code already exists
       // 'invalid' : project code does not meet the criteria of starting with a letter
       //        and only containing lower-case letters, numbers, or dashes
       // 'ok'      : project code valid and unique
       */
      $scope.projectCodeState = 'unchecked';

      $scope.isSubmitting = false;

      $scope.resetValidateProjectForm = function resetValidateProjectForm(): void {
        if (!$scope.isSubmitting) {
          $scope.projectCodeState = 'unchecked';
        }
      };

      // Check projectCode is unique and valid
      $scope.checkProjectCode = function checkProjectCode(): void {
        if (isValidProjectCode($scope.newProject.projectCode)) {
          $scope.projectCodeState = 'loading';
          projectService.projectCodeExists($scope.newProject.projectCode).then((result: JsonRpcResult) => {
            if (!$scope.isSubmitting) {
              if (result.ok) {
                if (result.data) {
                  $scope.projectCodeState = 'exists';
                } else {
                  $scope.projectCodeState = 'ok';
                }
              }
            }
          });
        } else if ($scope.newProject.projectCode === '') {
          $scope.projectCodeState = 'empty';
        } else {
          $scope.projectCodeState = 'invalid';
        }
      };

    }
  ])
  .name;
