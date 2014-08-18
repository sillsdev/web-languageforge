'use strict';

angular.module('lexicon.settings', ['bellows.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.textdrop'])
  .controller('SettingsCtrl', ['$scope', '$filter', 'userService', 'sessionService', 'silNoticeService', 'lexProjectService',  
  function($scope, $filter, userService, ss, notice, lexProjectService) {
    lexProjectService.setBreadcrumbs('settings', $filter('translate')('Project Settings'));
    
    $scope.rights.canEditCommunicationSettings = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
    
    $scope.readProject = function() {
      lexProjectService.readProject(function(result) {
        if (result.ok) {
          $.extend($scope.project, result.data.project);
        }
      });
    };
    
    $scope.readProject();
    
    $scope.updateProject = function() {
       var settings = {
            projectName: $scope.project.projectName,
            interfaceLanguageCode: $scope.project.interfaceLanguageCode,
            featured: $scope.project.featured
       };

      lexProjectService.updateProject(settings, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $scope.project.projectName + " settings updated successfully");
        }
      });
    };
    
    $scope.settings = {
      'sms': {},
      'email': {}
    };
      
    $scope.readCommunicationSettings = function() {
      lexProjectService.readSettings(function(result) {
        if (result.ok) {
          $scope.settings.sms = result.data.sms;
          $scope.settings.email = result.data.email;
        }
      });
    };
    
    $scope.updateCommunicationSettings = function() {
      lexProjectService.updateSettings($scope.settings.sms, $scope.settings.email, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $scope.project.projectName + " communication settings updated successfully");
        }
      });
    };
    
  }])
  ;
