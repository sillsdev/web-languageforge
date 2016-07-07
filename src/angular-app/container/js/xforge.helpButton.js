'use strict';

angular.module('xforge.helpButton', ['jsonRpc', 'ui.bootstrap', 'pascalprecht.translate', 'bellows.services'])
  /*
  .service('helpButtonService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.checkIfCanShowPageButton = function(urlPath, hashPath, callback) {
      jsonRpc.call('xforge_frame_can_show_page_help_button', [urlPath, hashPath], callback);
    };
  }])
  */
  .controller('helpButtonController', ['$scope', '$modal', '$location', 'sessionService', function($scope, $modal, $location, ss) {
    
    $scope.helpFilePath = '';

    // this function should be run whenever the location changes
    function isHelpFilePresentOnServer() {
      var helpFilePathsAvailable = ss.session.helps.filePaths;
      var hashPath = $location.path();
      // couldn't figure out an easy way to get just the pathname from $location, so using window.location instead
      var appName = window.location.pathname.split('/')[2];

      var partialPath = "/helps/en/page/" + appName;
      if (hashPath) {
        partialPath += hashPath.replace('/', '-');
      }
      partialPath += ".html";
      console.log("Looking for: " + partialPath);

      var foundFile = false;
      angular.forEach(helpFilePathsAvailable, function(path) {
        console.log("path = " + path);
        console.log("partialPath = " + partialPath);
        if (path.indexOf(partialPath) > -1) {
          console.log("path.indexOf(partialPath) = " + path.indexOf(partialPath));
          foundFile = true;
          $scope.helpFilePath = "/" + path;
          console.log("found help file: " + $scope.helpFilePath);
        }

      });
      return foundFile;

    }

    $scope.showButton = isHelpFilePresentOnServer();



    /*
    helpButtonService.checkIfCanShowPageButton(location.pathname, location.hash, function(result) {
      if (result.data.showButton) {
        $scope.helpFilePath = result.data.helpFilePath;
        $scope.showButton = true;
      }
    });
    */


    $scope.showHelpContent = function showHelpContent() {
      if ($scope.helpFilePath) {
        console.log($scope.helpFilePath);
        $modal.open({
          templateUrl: $scope.helpFilePath,
          controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
            $scope.close = function () {
              $modalInstance.close();
            };
          }]
        });
      }

    };
    
  }]);
