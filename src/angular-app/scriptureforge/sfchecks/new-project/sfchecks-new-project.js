'use strict';

angular.module('sfchecks-new-project', ['ui.router', 'pascalprecht.translate', 'bellows.services',
  'palaso.ui.listview', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.utils', 'wc.Directives'])
  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      // State machine from ui.router
      $stateProvider
        .state('newProject', {

          // Need quotes around Javascript keywords like 'abstract' so YUI compressor won't complain
          'abstract': true, // jscs:ignore
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
        .when('', ['$state', function ($state) {
          if (!$state.$current.navigable) {
            $state.go('newProject.name');
          }
        }]);
    }])
  .controller('NewSfchecksProjectCtrl', ['$scope', 'projectService', 'sessionService',
    'silNoticeService', '$window', 'sfchecksLinkService',
    function ($scope, projectService, ss, notice, $window, linkService) {
      $scope.newProject = {};

      // Add new project
      $scope.addProject = function () {
        if ($scope.projectCodeState == 'ok') {
          $scope.isSubmitting = true;
          projectService.create($scope.newProject.projectName, $scope.newProject.projectCode,
            'sfchecks', function (result) {
              //$scope.isSubmitting = false;
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

      $scope._projectNameToCode = function (name) {
        if (angular.isUndefined(name)) return undefined;
        return 'sfchecks-' + name.toLowerCase().replace(/ /g, '_');
      };

      $scope._isValidProjectCode = function (code) {
        if (angular.isUndefined(code)) return false;

        // Valid project codes start with a letter and only contain lower-case letters, numbers,
        // dashes and underscores
        var pattern = /^[a-z][a-z0-9\-_]*$/;
        return pattern.test(code);
      };

      $scope.$watch('newProject.projectName', function (newValue) {
        if (!$scope.newProject.editProjectCode) {
          if (angular.isUndefined(newValue)) {
            $scope.newProject.projectCode = '';
          } else {
            $scope.newProject.projectCode = $scope._projectNameToCode(newValue);
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

      $scope.resetValidateProjectForm = function () {
        if (!$scope.isSubmitting) {
          $scope.projectCodeState = 'unchecked';
        }
      };

      // Check projectCode is unique and valid
      $scope.checkProjectCode = function () {
          if ($scope._isValidProjectCode($scope.newProject.projectCode)) {
            $scope.projectCodeState = 'loading';
            projectService.projectCodeExists($scope.newProject.projectCode, function (result) {
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
          } else if ($scope.newProject.projectCode == '') {
            $scope.projectCodeState = 'empty';
          } else {
            $scope.projectCodeState = 'invalid';
          }
        };

    }])

  ;
