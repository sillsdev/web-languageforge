'use strict';

angular.module('xforge.helpButton', ['jsonRpc', 'ui.bootstrap', 'pascalprecht.translate'])
  .service('helpButtonService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.checkIfCanShowPageButton = function(urlPath, hashPath, callback) {
      jsonRpc.call('xforge_frame_can_show_page_help_button', [urlPath, hashPath], callback);
    };
  }])
  .controller('helpButtonController', ['$scope', '$modal', 'helpButtonService', function($scope, $modal, helpButtonService) {
    $scope.showButton = false;
    $scope.helpFilePath = '';

    helpButtonService.checkIfCanShowPageButton(location.pathname, location.hash, function(result) {
      if (result.data.showButton) {
        $scope.helpFilePath = result.data.helpFilePath;
        $scope.showButton = true;
      }
    });


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
