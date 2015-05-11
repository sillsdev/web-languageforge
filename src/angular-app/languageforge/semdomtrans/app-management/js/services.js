'use strict';

angular.module('semDomTransAppManagement.services', ['jsonRpc'])

.service('semDomTransAppManagementService', ['jsonRpc',
function(jsonRpc) {
  jsonRpc.connect('/api/sf');

  this.getDto = function getDto(callback) {
    jsonRpc.call('semdomtrans_app_management_dto', [], callback);
  };

  this.doExport = function doExport(callback) {
    jsonRpc.call('semdomtrans_export_all_projects', [], callback);
  };

}]);
