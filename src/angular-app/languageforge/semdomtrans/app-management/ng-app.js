'use strict';

angular.module('semdomtrans-app-management', ['semDomTransAppManagement.services', 'bellows.services', 'palaso.ui.listview', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.utils', 'wc.Directives'])
  .controller('semDomTransAppManagementCtrl', ['$scope', 'semDomTransAppManagementService', 'sessionService', 'silNoticeService', '$window',
    function($scope, appService, ss, notice, $window) {

      $scope.project = ss.session.project;

      $scope.loadDto = function loadDto() {
        appService.getDto(function(result) {
          if (result.ok) {
            $scope.languages = result.data.languages;
            $scope.dtoLoaded = true;
          }
        });
      };
      $scope.loadDto();

      $scope.doExport = function doExport() {
        notice.setLoading("Preparing export on server");
        appService.doExport(function(result) {
          notice.cancelLoading();
          if (result.ok) {
            var downloadUrl = result.data.exportUrl;
            $window.location.href = downloadUrl;
          }
        });
      };
    }])
;
