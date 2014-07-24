'use strict';

angular.module('lexicon.view.settings', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate'])
  .controller('ViewSettingsCtrl', ['$scope', 'silNoticeService', 'lexProjectService', 'sessionService', '$filter', '$modal', 
                                   function($scope, notice, lexProjectService, ss, $filter, $modal) {
    lexProjectService.setBreadcrumbs('viewSettings', $filter('translate')('View Settings'));
    
    $scope.configDirty = angular.copy($scope.projectSettings.config);
    $scope.roleViews = [
      {name: $filter('translate')('Observer'), role: 'observer', view: $scope.configDirty.roleViews['observer']},
      {name: $filter('translate')('Commenter'), role: 'observer_with_comment', view: $scope.configDirty.roleViews['observer_with_comment']},
      {name: $filter('translate')('Contributor'), role: 'contributor', view: $scope.configDirty.roleViews['contributor']},
      {name: $filter('translate')('Manager'), role: 'project_manager', view: $scope.configDirty.roleViews['project_manager']}
    ];
    
    $scope.fieldConfig = {};
    angular.forEach($scope.configDirty.entry.fieldOrder, function(fieldName) {
      if (angular.isDefined($scope.configDirty.entry.fields[fieldName])) {
        if ($scope.configDirty.entry.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields[fieldName];
        }
      } else {
        if ($scope.configDirty.entry.fields.customFields.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.customFields.fields[fieldName];
        }
      }
    });
    angular.forEach($scope.configDirty.entry.fields.senses.fieldOrder, function(fieldName) {
      if (angular.isDefined($scope.configDirty.entry.fields.senses.fields[fieldName])) {
        if ($scope.configDirty.entry.fields.senses.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields[fieldName];
        }
      } else {
        if ($scope.configDirty.entry.fields.senses.fields.customFields.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.customFields.fields[fieldName];
        }
      }
    });
    angular.forEach($scope.configDirty.entry.fields.senses.fields.examples.fieldOrder, function(fieldName) {
      if (angular.isDefined($scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName])) {
        if ($scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName];
        }
      } else {
        if ($scope.configDirty.entry.fields.senses.fields.examples.fields.customFields.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.examples.fields.customFields.fields[fieldName];
        }
      }
    });
    
    $scope.isEntryField = function isEntryField(fieldName) {
      return $scope.configDirty.entry.fields[fieldName].type !== 'fields';
    };
    $scope.isSensesField = function isSensesField(fieldName) {
      return $scope.configDirty.entry.fields.senses.fields[fieldName].type !== 'fields';
    };
    $scope.isExamplesField = function isExamplesField(fieldName) {
      return $scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName].type !== 'fields';
    };
    
    $scope.isAtLeastOneSense = function isAtLeastOneSense(view) {
      var atLeastOne = false;
      angular.forEach($scope.configDirty.entry.fields.senses.fieldOrder, function(fieldName) {
        atLeastOne = atLeastOne || view.showFields[fieldName];
      });
      return atLeastOne;
    };
    
    $scope.allRolesHaveAtLeastOneSense = function allRolesHaveAtLeastOneSense() {
      var atLeastOne = true;
      angular.forEach($scope.roleViews, function(roleView) {
        atLeastOne = atLeastOne && $scope.isAtLeastOneSense(roleView.view);
      });
      return atLeastOne;
    };
    
    $scope.settingsApply = function settingsApply() {
      lexProjectService.updateConfiguration($scope.configDirty, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $filter('translate')("View settings updated successfully"));
          $scope.viewSettingForm.$setPristine();
          $scope.projectSettings.config = angular.copy($scope.configDirty);
        }
      });
    };
  
  }])
  ;
