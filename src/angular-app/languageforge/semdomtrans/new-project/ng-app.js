'use strict';

angular.module('semdomtrans-new-project',
  [
    'ui.router',
    'bellows.services',
    'bellows.filters',
    'ui.bootstrap',
    'ngAnimate',
    'semdomtrans.services',
    'pascalprecht.translate' 
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
  function($stateProvider, $urlRouterProvider, $translateProvider) {
    
    $urlRouterProvider
    .when('', ['$state', function ($state) {
      if (! $state.$current.navigable) {
        $state.go('newProject');
      }
    }]);
    
    // State machine from ui.router
    $stateProvider
      .state('newProject', {

        templateUrl: '/angular-app/languageforge/semdomtrans/new-project/views/new-project.html',
        controller: 'projectSetupCtrl'
      })

  }])
.controller('projectSetupCtrl', ['$scope', '$state', '$location', '$window', 'semdomtransSetupService', 'projectService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, $state, $location, $window, semdomSetupApi, projectService, sessionService, modal, notice) {
  $scope.languageCode = "";
  $scope.canCreate = true;
  var checksBeingMade = 0;
  semdomSetupApi.getOpenProjects(function(result) {
    if (result.ok) {
      $scope.openProjects = result.data;
    }
  });
  
  $scope.checkLanguageAvailability = function checkLanguageAvailability() {
    $scope.canCreate = false;
    checksBeingMade++;
    semdomSetupApi.doesProjectExist($scope.languageCode, function(result) {
      checksBeingMade--;
      if (result.ok && checksBeingMade == 0) {
        $scope.canCreate = result.data;
      }
      });
    }
  $scope.requestProjectJoin = function requestProjectJoin(project) {
    var request = "Are you sure you want to send a join request to <b>' " + project.projectName + " '</b>";
    modal.showModalSimple('Request Project Join', request, 'Cancel', 'Request Project Join').then(function() {
      projectService.sendJoinRequest(project.id, function(result) {
        ;
      });
    });
  };
  
  $scope.createProject = function createProject() {
    semdomSetupApi.createProject($scope.languageCode, function(result) {
        if (result.ok) {
          $window.location = result.data;
        }
      });
  }  
}]);
