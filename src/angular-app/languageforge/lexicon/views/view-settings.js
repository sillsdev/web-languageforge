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

    $scope.currentField = {
      'name': '',
      'inputSystems': {
        'fieldOrder': [],
        'selecteds': {}
      }
    };
    $scope.selectField = function selectField(fieldName) {
      if ($scope.currentField.name !== fieldName) {
        var inputSystems = $scope.fieldConfig[fieldName].inputSystems;
        
        $scope.currentField.name = fieldName;
        
        $scope.currentField.inputSystems.selecteds = {};
        angular.forEach(inputSystems, function(tag) {
          $scope.currentField.inputSystems.selecteds[tag] = true;
        });
        
        // if the field uses input systems, add the selected systems first then the unselected systems
        if (inputSystems) {
          $scope.currentField.inputSystems.fieldOrder = inputSystems;
          angular.forEach($scope.configDirty.inputSystems, function(inputSystem, tag) {
            if(! (tag in $scope.currentField.inputSystems.selecteds)) {
              $scope.currentField.inputSystems.fieldOrder.push(tag);
            }
          });
        }
      }
    };
    $scope.selectField('lexeme');
    
    $scope.moveUp = function moveUp(currentTag) {
      var currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1];
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1] = currentTag;
      $scope.fieldConfig[$scope.currentField.name].inputSystems = [];
      angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
        if ($scope.currentField.inputSystems.selecteds[tag]) {
          $scope.fieldConfig[$scope.currentField.name].inputSystems.push(tag);
        }
      });
      $scope.viewSettingForm.$setDirty();
    };
    $scope.moveDown = function moveDown(currentTag) {
      var currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1];
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1] = currentTag;
      $scope.fieldConfig[$scope.currentField.name].inputSystems = [];
      angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
        if ($scope.currentField.inputSystems.selecteds[tag]) {
          $scope.fieldConfig[$scope.currentField.name].inputSystems.push(tag);
        }
      });
      $scope.viewSettingForm.$setDirty();
    };
    
    $scope.fieldIsHidden= function fieldIsHidden(fieldName, showAllFields) {
      if (angular.isUndefined($scope.fieldConfig[fieldName]) || ! ('hideIfEmpty' in $scope.fieldConfig[fieldName])) {
        return true;
      }
      return !showAllFields && $scope.fieldConfig[fieldName].hideIfEmpty;
    };
    
    $scope.isAtLeastOneSense = function isAtLeastOneSense(view) {
      var atLeastOne = false;
      angular.forEach($scope.configDirty.entry.fields.senses.fieldOrder, function(fieldName) {
        if (fieldName in view.fields) {
          atLeastOne = atLeastOne || view.fields[fieldName].show;
        }
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
