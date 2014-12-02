'use strict';

angular.module('palaso.ui.mockUpload', [])

  // Palaso UI Mock Upload
  .directive('puiMockUpload', [function() {
    return {
      restrict : 'E',
      templateUrl : '/angular-app/bellows/directive/pui-mock-upload.html',
      scope : {
        puiDoUpload : "&"
      },
      controller: ['$scope', function($scope) {
        
        $scope.toggleControls = function toggleControls() {
          $scope.showControls = ! $scope.showControls;
          $scope.mockFiles =[{}];
        };
        
        $scope.doUpload = function doUpload() {
          
          // see http://stackoverflow.com/questions/23477859/angularjs-call-function-on-directive-parent-scope-with-directive-scope-argumen
          $scope.puiDoUpload({filesArray: $scope.mockFiles});
        };

      }]
    };
  }])
  ;
