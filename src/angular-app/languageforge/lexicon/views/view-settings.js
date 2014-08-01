'use strict';

angular.module('lexicon.view.settings', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'lexicon.services'])
  .controller('ViewSettingsCtrl', ['$scope', 'silNoticeService', 'userService', 'lexProjectService', 'sessionService', '$filter', '$modal', 'lexConfigService',
  function($scope, notice, userService, lexProjectService, ss, $filter, $modal, lexConfigService) {
    lexProjectService.setBreadcrumbs('viewSettings', $filter('translate')('View Settings'));
    
    $scope.configDirty = angular.copy($scope.projectSettings.config);
    $scope.roleTabs = [
      {name: $filter('translate')('Observer'), role: 'observer', view: $scope.configDirty.roleViews['observer'], active: true},
      {name: $filter('translate')('Commenter'), role: 'observer_with_comment', view: $scope.configDirty.roleViews['observer_with_comment']},
      {name: $filter('translate')('Contributor'), role: 'contributor', view: $scope.configDirty.roleViews['contributor']},
      {name: $filter('translate')('Manager'), role: 'project_manager', view: $scope.configDirty.roleViews['project_manager']}
    ];
    $scope.state = 'userSelectList';
    $scope.list = {};
    
    lexProjectService.users(function(result) {
      if (result.ok) {
        $scope.users = result.data.users;
        $scope.usersWithSettings = {};
        $scope.usersWithoutSettings = [];
        angular.forEach($scope.users, function(user) {
          $scope.usersWithSettings[user.id] = user;
          if (! (user.id in $scope.configDirty.userViews)) {
            $scope.usersWithoutSettings.push(user);
          }
        });
      }
    });

    $scope.isCustomField = lexConfigService.isCustomField;

    $scope.fieldConfig = {};
    angular.forEach($scope.configDirty.entry.fieldOrder, function(fieldName) {
      if (angular.isDefined($scope.configDirty.entry.fields[fieldName])) {
        if ($scope.configDirty.entry.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields[fieldName];
        }
//      } else {
//        if ($scope.configDirty.entry.fields.customFields.fields[fieldName].type !== 'fields') {
//          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.customFields.fields[fieldName];
//        }
      }
    });
    angular.forEach($scope.configDirty.entry.fields.senses.fieldOrder, function(fieldName) {
      if (angular.isDefined($scope.configDirty.entry.fields.senses.fields[fieldName])) {
        if ($scope.configDirty.entry.fields.senses.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields[fieldName];
        }
//      } else {
//        if ($scope.configDirty.entry.fields.senses.fields.customFields.fields[fieldName].type !== 'fields') {
//          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.customFields.fields[fieldName];
//        }
      }
    });
    angular.forEach($scope.configDirty.entry.fields.senses.fields.examples.fieldOrder, function(fieldName) {
      if (angular.isDefined($scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName])) {
        if ($scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName].type !== 'fields') {
          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName];
        }
//      } else {
//        if ($scope.configDirty.entry.fields.senses.fields.examples.fields.customFields.fields[fieldName].type !== 'fields') {
//          $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.examples.fields.customFields.fields[fieldName];
//        }
      }
    });

    $scope.settingsApply = function settingsApply() {
      lexProjectService.updateConfiguration($scope.configDirty, [], function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $filter('translate')("View settings updated successfully"));
          $scope.viewSettingForm.$setPristine();
          $scope.projectSettings.config = angular.copy($scope.configDirty);
        }
      });
    };
  
    $scope.currentField = {
      'name': '',
      'inputSystems': {
        'fieldOrder': [],
        'selecteds': {}
      }
    };
    $scope.selectField = function selectField(fieldName, view) {
      if ($scope.currentField.name !== fieldName) {
        var inputSystems = view.fields[fieldName].inputSystems;
        
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
    $scope.selectField('lexeme', $scope.configDirty.roleViews['observer']);
    
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
      if (! view) return false;
      angular.forEach($scope.configDirty.entry.fields.senses.fieldOrder, function(fieldName) {
        if (fieldName in view.fields) {
          atLeastOne = atLeastOne || view.fields[fieldName].show;
        }
      });
      return atLeastOne;
    };
    
    $scope.allRolesHaveAtLeastOneSense = function allRolesHaveAtLeastOneSense() {
      var atLeastOne = true;
      angular.forEach($scope.roleTabs, function(roleTab) {
        atLeastOne = atLeastOne && $scope.isAtLeastOneSense(roleTab.view);
      });
      return atLeastOne;
    };
    
    $scope.allUsersHaveAtLeastOneSense = function allUsersHaveAtLeastOneSense() {
      var atLeastOne = true;
      angular.forEach($scope.configDirty.userViews, function(userView) {
        atLeastOne = atLeastOne && $scope.isAtLeastOneSense(userView);
      });
      return atLeastOne;
    };
    
    $scope.selectUser = function selectUser(userId) {
      $scope.currentUserId = userId;
      $scope.state = 'userSettings';
    };
    
    $scope.typeahead = {};
    $scope.typeahead.users = [];
    $scope.typeahead.userName = '';
    $scope.typeahead.searchUsers = function searchUsers(query) {
      $scope.typeahead.users = $filter('filter')($scope.usersWithoutSettings, query);
    };
    
    $scope.typeahead.selectUser = function selectuser(user) {
      $scope.typeahead.user = user;
      $scope.typeahead.userName = user.name;
    };
    
    $scope.addUser = function addUser() {
      if ($scope.typeahead.user) {
        var user = $scope.typeahead.user, 
          userView = angular.copy($scope.configDirty.roleViews[user.role]);
        deleteFromArray(user, 'id', $scope.usersWithoutSettings);
        $scope.usersWithSettings[user.id] = user;
        $scope.configDirty.userViews[user.id] = userView;
        $scope.typeahead.userName = '';
        $scope.viewSettingForm.$setDirty();
      }
    };

    $scope.imageSource = function(avatarRef) {
      return avatarRef ? '/images/shared/avatar/' + avatarRef : '/images/shared/avatar/anonymous02.png';
    };
    
    $scope.goSelectUser = function goSelectUser() {
      $scope.state = 'userSelectList';
      $scope.currentUserId = '';
    };
    
    $scope.removeSelectedMemberSettings = function removeSelectedMemberSettings() {
      $scope.usersWithoutSettings.push($scope.usersWithSettings[$scope.currentUserId]);
      delete $scope.usersWithSettings[$scope.currentUserId];
      delete $scope.configDirty.userViews[$scope.currentUserId];
      $scope.viewSettingForm.$setDirty();
      $scope.goSelectUser();
    };
    
    function deleteFromArray(deleteItem, key, items) {
      var itemIndex = - 1;
      angular.forEach(items, function(item, i) {
        if (item[key] === deleteItem[key]) {
          itemIndex = i;
          return;
        }
      });
      if (itemIndex > -1) {
        items.splice(itemIndex, 1);
      }
    };
    
    function activeTabRole() {
      var active = $scope.roleTabs.filter(function(roletab) {
          return roletab.active;
        })[0];
      if (angular.isUndefined(active)) return false;
      return active.role;
    };
    
    $scope.$watchCollection('currentField.inputSystems.selecteds', function(newValue) {
      if (angular.isDefined(newValue)) {
        var role = activeTabRole();
        if (role) {
          if (angular.isDefined($scope.configDirty.roleViews[role].fields[$scope.currentField.name].inputSystems)) {
            $scope.configDirty.roleViews[role].fields[$scope.currentField.name].inputSystems = [];
            angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
              if ($scope.currentField.inputSystems.selecteds[tag]) {
                $scope.configDirty.roleViews[role].fields[$scope.currentField.name].inputSystems.push(tag);
              }
            });
          }
        } else {
          if (angular.isDefined($scope.configDirty.userViews[$scope.currentUserId].fields[$scope.currentField.name].inputSystems)) {
            $scope.configDirty.userViews[$scope.currentUserId].fields[$scope.currentField.name].inputSystems = [];
            angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
              if ($scope.currentField.inputSystems.selecteds[tag]) {
                $scope.configDirty.userViews[$scope.currentUserId].fields[$scope.currentField.name].inputSystems.push(tag);
              }
            });
          }
        }
      }
    });
    
  }])
  ;
