'use strict';

angular.module('semdomtrans-new-project',
  [
    'ui.router',
    'bellows.services',
    'bellows.filters',
    'ui.bootstrap',
    'ngAnimate',
    'semdomtrans.services',
    'palaso.ui.language',
    'pascalprecht.translate'
  ])
  .config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider
      .when('', ['$state', function ($state) {
        if (!$state.$current.navigable) {
          $state.go('newProject');
        }
      }]);

    // State machine from ui.router
    $stateProvider
      .state('newProject', {
        templateUrl:
          '/angular-app/languageforge/semdomtrans/new-project/views/new-project-main.html',
        controller: 'projectSetupCtrl'
      });

  }])
  .controller('projectSetupCtrl', ['$scope', '$state', '$location', '$window',
    'semdomtransSetupService', 'projectService',  'sessionService', '$modal', 'modalService',
    'silNoticeService',
  function ($scope, $state, $location, $window,
            semdomSetupApi, projectService, sessionService, $modal, modalService,
            notice) {
    $scope.languageCode = '';
    $scope.canCreate = false;
    $scope.languageHasGoogleTranslateData = false;
    var checksBeingMade = 0;
    semdomSetupApi.getOpenProjects(function (result) {
      if (result.ok) {
        $scope.openProjects = result.data;
      }
    });

    $scope.openNewLanguageModal = function openNewLanguageModal() {
      var modalInstance = $modal.open({
        templateUrl: '/angular-app/languageforge/lexicon/views/select-new-language.html',
        controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
          $scope.selected = {
            code: '',
            language: {}
          };
          $scope.add = function () {
            $modalInstance.close($scope.selected);
          };
        }]
      });
      modalInstance.result.then(function (selected) {
        $scope.languageCode = selected.code;
        $scope.languageName = selected.language.name;
        $scope.checkLanguageAvailability();
      });
    };

    $scope.checkLanguageAvailability = function checkLanguageAvailability() {
      if ($scope.languageCode == '') {
        $scope.canCreate = false;
      } else {

        $scope.canCreate = false;
        checksBeingMade++;
        semdomSetupApi.doesProjectExist($scope.languageCode, function (result) {
          checksBeingMade--;
          if (result.ok && checksBeingMade == 0) {
            $scope.canCreate = result.data;
          }
        });
      }

      semdomSetupApi.doesGoogleTranslateDataExist($scope.languageCode, function (result) {
        $scope.languageHasGoogleTranslateData = result.data;
      });

    };

    $scope.requestProjectJoin = function requestProjectJoin(project) {
      var request = 'Are you sure you want to send a join request to <b>\' ' + project.projectName +
        ' \'</b>';
      modalService.showModalSimple('Request Project Join', request, 'Cancel',
        'Request Project Join').then(function () {
        projectService.sendJoinRequest(project.id, function () {});
      });
    };

    $scope.createProject = function createProject(useGoogleTranslateData) {

      notice.setLoading('Creating and Loading Semdomtrans Project.');
      semdomSetupApi.createProject($scope.languageCode, $scope.languageName, useGoogleTranslateData,
        function (result) {
          notice.cancelLoading();
          if (result.ok) {
            $window.location = result.data;
          }
        });
    };
  }]);
