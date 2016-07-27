'use strict';

angular.module('xforge.helpButton', ['jsonRpc', 'ui.bootstrap', 'pascalprecht.translate',
  'bellows.services'])
  /*
  .service('helpButtonService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.checkIfCanShowPageButton = function(urlPath, hashPath, callback) {
      jsonRpc.call('xforge_frame_can_show_page_help_button', [urlPath, hashPath], callback);
    };
  }])
  */
  .controller('helpButtonController', ['$scope', 'modalService', '$location', 'sessionService',
  function ($scope, modalService, $location, ss) {

    $scope.helpFilePath = '';

    // this function should be run whenever the location changes
    function isHelpFilePresentOnServer() {
      // couldn't figure out an easy way to get just the pathname from $location,
      // so using window.location instead
      var appName = window.location.pathname.split('/')[2];
      var hashPath = $location.path();
      var helpFilePathsAvailable = [];
      if (angular.isDefined(ss.session.helps)) {
        helpFilePathsAvailable = ss.session.helps.filePaths;
      }

      var partialPath = '/helps/en/page/' + appName;
      if (hashPath) {
        partialPath += hashPath.replace('/', '-');
      }

      partialPath += '.html';

      //console.log("Looking for: " + partialPath);

      var foundFile = false;
      angular.forEach(helpFilePathsAvailable, function (path) {
        //console.log("path = " + path);
        //console.log("partialPath = " + partialPath);
        if (path.indexOf(partialPath) > -1) {
          //console.log("path.indexOf(partialPath) = " + path.indexOf(partialPath));
          foundFile = true;
          $scope.helpFilePath = '/' + path;

          //console.log("found help file: " + $scope.helpFilePath);
        }

      });

      return foundFile;
    }

    $scope.showButton = isHelpFilePresentOnServer();

    $scope.showHelpContent = function showHelpContent() {
      if ($scope.helpFilePath) {
        console.log($scope.helpFilePath);
        modalService.showModalSimpleWithCustomTemplate($scope.helpFilePath);
      }
    };

  }]);
