'use strict';

angular.module('projectManagement.services', ['jsonRpc'])

.service('projectManagementService', ['jsonRpc',
function(jsonRpc) {
  jsonRpc.connect('/api/sf');

  this.getDto = function getDto(callback) {
    jsonRpc.call('project_management_dto', [], callback);
  };

  this.archiveProject = function archiveProject(callback) {
    jsonRpc.call('project_archive', [], callback);
  };

  this.runReport = function runReport(reportName, params, callback) {
    params = params || [];
    jsonRpc.call('project_management_report_' + reportName, params, callback);
  };

}]);
