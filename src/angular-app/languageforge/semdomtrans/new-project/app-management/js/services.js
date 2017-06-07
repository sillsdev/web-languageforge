'use strict';

angular.module('semDomTransAppManagement.services', ['bellows.services'])

.service('semDomTransAppManagementService', ['apiService',
function(api) {

  this.getDto = api.method('semdomtrans_app_management_dto');
  this.doExport = api.method('semdomtrans_export_all_projects');

}]);
