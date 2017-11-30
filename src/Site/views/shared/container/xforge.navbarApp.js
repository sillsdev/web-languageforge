'use strict';

angular.module('xforge.navbarApp', ['bellows.services', 'ui.bootstrap', 'pascalprecht.translate',
  'bellows.services'])
  /*
  .service('helpButtonService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.checkIfCanShowPageButton = function(urlPath, hashPath, callback) {
      jsonRpc.call('xforge_frame_can_show_page_help_button', [urlPath, hashPath], callback);
    };
  }])
  */
  .controller('navbarController', ['$scope', 'modalService', '$location', 'sessionService',
    '$window', 'projectService',
    function ($scope, modalService, $location, sessionService,
            $window, projectService) {
    $scope.helpFilePath = '';
    $scope.projectTypeNames = projectService.data.projectTypeNames;
    $scope.projectTypesBySite = projectService.data.projectTypesBySite;
    $scope.rights = {};

    // this function should be run whenever the location changes
    function isHelpFilePresentOnServer() {
      var appName = $window.location.pathname.split('/')[2];
      var partialPath = '/helps/en/page/' + appName;
      partialPath += $location.path().replace('/', '-') + '.html';

      return sessionService.getSession().then(function (session) {
        var foundFile = false;
        var helpFilePathsAvailable = session.helps ? session.helps.filePaths : [];

        $scope.rights.canCreateProject =
          session.hasSiteRight(sessionService.domain.PROJECTS, sessionService.operation.CREATE);

        $scope.siteName = session.baseSite();
        helpFilePathsAvailable.forEach(function (path) {
          if (path.indexOf(partialPath) !== -1) {
            foundFile = true;
            $scope.helpFilePath = '/' + path;
          }
        });

        return foundFile;
      });
    }

    isHelpFilePresentOnServer().then(function (shown) {
      $scope.showButton = shown;
    });

    $scope.showHelpContent = function showHelpContent() {
      if ($scope.helpFilePath) {
        //console.log($scope.helpFilePath);
        modalService.showModalSimpleWithCustomTemplate($scope.helpFilePath);
      }
    };

  }])

  ;
