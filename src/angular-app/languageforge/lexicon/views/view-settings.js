'use strict';

angular.module('lexicon.view.settings', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'lexicon.services'])
  .controller('ViewSettingsCtrl', ['$scope', 'silNoticeService', 'userService', 'lexProjectService', 'sessionService', '$filter', '$modal', 'lexConfigService',
  function($scope, notice, userService, lexProjectService, ss, $filter, $modal, lexConfigService) {
    var roleTabOrder = ['observer', 'observer_with_comment', 'contributor', 'project_manager'];

    lexProjectService.setBreadcrumbs('viewSettings', $filter('translate')('View Settings'));
    
    $scope.configDirty = angular.copy($scope.projectSettings.config);
    $scope.roleTabs = [
      {name: $filter('translate')('Observer'), role: 'observer', view: $scope.configDirty.roleViews['observer'], active: true},
      {name: $filter('translate')('Commenter'), role: 'observer_with_comment', view: $scope.configDirty.roleViews['observer_with_comment']},
      {name: $filter('translate')('Contributor'), role: 'contributor', view: $scope.configDirty.roleViews['contributor']},
      {name: $filter('translate')('Manager'), role: 'project_manager', view: $scope.configDirty.roleViews['project_manager']}
    ];
    angular.forEach($scope.roleTabs, function(roleTab) {
      roleTab.currentField = {
        'name': '',
        'inputSystems': {
          'fieldOrder': [],
          'selecteds': {}
        }
      };
    });
    $scope.userCurrentField = {};
    angular.forEach($scope.configDirty.userViews, function(userView, userId) {
      $scope.userCurrentField[userId] = {
        'name': '',
        'inputSystems': {
          'fieldOrder': [],
          'selecteds': {}
        }
      };
    });
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
    $scope.selectField = function selectField(fieldName, currentField, view) {
      if (currentField.name !== fieldName) {
        var inputSystems = view.fields[fieldName].inputSystems;
        
        currentField.name = fieldName;
        
        delete currentField.inputSystems.selecteds;
        currentField.inputSystems.selecteds = {};
        angular.forEach(inputSystems, function(tag) {
          currentField.inputSystems.selecteds[tag] = true;
        });
        
        // if the field uses input systems, add the selected systems first then the unselected systems
        if (inputSystems) {
          delete currentField.inputSystems.fieldOrder;
          currentField.inputSystems.fieldOrder = inputSystems;
          angular.forEach($scope.configDirty.inputSystems, function(inputSystem, tag) {
            if(! (tag in currentField.inputSystems.selecteds)) {
              currentField.inputSystems.fieldOrder.push(tag);
            }
          });
        }
      }
    };
    angular.forEach($scope.roleTabs, function(roleTab) {
      $scope.selectField('lexeme', roleTab.currentField, roleTab.view);
    });
    
    $scope.moveUp = function moveUp(currentTag, currentField, view) {
      var currentTagIndex = currentField.inputSystems.fieldOrder.indexOf(currentTag);
      currentField.inputSystems.fieldOrder[currentTagIndex] = currentField.inputSystems.fieldOrder[currentTagIndex - 1];
      currentField.inputSystems.fieldOrder[currentTagIndex - 1] = currentTag;
      view.fields[currentField.name].inputSystems = [];
      angular.forEach(currentField.inputSystems.fieldOrder, function(tag) {
        if (currentField.inputSystems.selecteds[tag]) {
          view.fields[currentField.name].inputSystems.push(tag);
        }
      });
      $scope.viewSettingForm.$setDirty();
    };
    $scope.moveDown = function moveDown(currentTag, currentField, view) {
      var currentTagIndex = currentField.inputSystems.fieldOrder.indexOf(currentTag);
      currentField.inputSystems.fieldOrder[currentTagIndex] = currentField.inputSystems.fieldOrder[currentTagIndex + 1];
      currentField.inputSystems.fieldOrder[currentTagIndex + 1] = currentTag;
      view.fields[currentField.name].inputSystems = [];
      angular.forEach(currentField.inputSystems.fieldOrder, function(tag) {
        if (currentField.inputSystems.selecteds[tag]) {
          view.fields[currentField.name].inputSystems.push(tag);
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
/*    
    function activeTabRole() {
      var active = $scope.roleTabs.filter(function(roletab) {
          return roletab.active;
        })[0];
      if (angular.isUndefined(active)) return false;
      return active.role;
    };
    
    $scope.$watchCollection('roleTabs[0].currentField.inputSystems.selecteds', function(newValue) {
      if (angular.isDefined(newValue)) {
        var currentField = $scope.roleTabs[0].currentField;
        if (angular.isDefined($scope.configDirty.roleViews[roleTabOrder[0]].fields[currentField.name].inputSystems)) {
          $scope.configDirty.roleViews[roleTabOrder[0]].fields[currentField.name].inputSystems = [];
          angular.forEach(currentField.inputSystems.fieldOrder, function(tag) {
            if (currentField.inputSystems.selecteds[tag]) {
              $scope.configDirty.roleViews[roleTabOrder[0]].fields[currentField.name].inputSystems.push(tag);
            }
          });
        }
      }
    });
    
    $scope.$watch('roleTabs[0].currentField.overrideInputSystems', function(newValue, oldValue) {
      if (angular.isDefined(newValue) && newValue !== oldValue && newValue) {
        var currentField = $scope.roleTabs[0].currentField;
        if (angular.isDefined($scope.configDirty.roleViews[roleTabOrder[0]].fields[currentField.name].inputSystems) &&
            $scope.configDirty.roleViews[roleTabOrder[0]].fields[currentField.name].inputSystems.length <= 0) {
          $scope.configDirty.roleViews[roleTabOrder[0]].fields[currentField.name].inputSystems = $scope.fieldConfig[currentField.name].inputSystems;
        }
      }
    });
    
    $scope.$watchCollection('roleTabs[1].currentField.inputSystems.selecteds', function(newValue) {
      if (angular.isDefined(newValue)) {
        var currentField = $scope.roleTabs[1].currentField;
        if (angular.isDefined($scope.configDirty.roleViews[roleTabOrder[1]].fields[currentField.name].inputSystems)) {
          $scope.configDirty.roleViews[roleTabOrder[1]].fields[currentField.name].inputSystems = [];
          angular.forEach(currentField.inputSystems.fieldOrder, function(tag) {
            if (currentField.inputSystems.selecteds[tag]) {
              $scope.configDirty.roleViews[roleTabOrder[1]].fields[currentField.name].inputSystems.push(tag);
            }
          });
        }
      }
    });
    
    $scope.$watch('roleTabs[1].currentField.overrideInputSystems', function(newValue, oldValue) {
      if (angular.isDefined(newValue) && newValue !== oldValue && newValue) {
        var currentField = $scope.roleTabs[1].currentField;
        if (angular.isDefined($scope.configDirty.roleViews[roleTabOrder[1]].fields[currentField.name].inputSystems) &&
            $scope.configDirty.roleViews[roleTabOrder[1]].fields[currentField.name].inputSystems.length <= 0) {
          $scope.configDirty.roleViews[roleTabOrder[1]].fields[currentField.name].inputSystems = $scope.fieldConfig[currentField.name].inputSystems;
        }
      }
    });
    
    $scope.$watchCollection('roleTabs[2].currentField.inputSystems.selecteds', function(newValue) {
      if (angular.isDefined(newValue)) {
        var currentField = $scope.roleTabs[2].currentField;
        if (angular.isDefined($scope.configDirty.roleViews[roleTabOrder[2]].fields[currentField.name].inputSystems)) {
          $scope.configDirty.roleViews[roleTabOrder[2]].fields[currentField.name].inputSystems = [];
          angular.forEach(currentField.inputSystems.fieldOrder, function(tag) {
            if (currentField.inputSystems.selecteds[tag]) {
              $scope.configDirty.roleViews[roleTabOrder[2]].fields[currentField.name].inputSystems.push(tag);
            }
          });
        }
      }
    });
    
    $scope.$watch('roleTabs[2].currentField.overrideInputSystems', function(newValue, oldValue) {
      if (angular.isDefined(newValue) && newValue !== oldValue && newValue) {
        var currentField = $scope.roleTabs[2].currentField;
        if (angular.isDefined($scope.configDirty.roleViews[roleTabOrder[2]].fields[currentField.name].inputSystems) &&
            $scope.configDirty.roleViews[roleTabOrder[2]].fields[currentField.name].inputSystems.length <= 0) {
          $scope.configDirty.roleViews[roleTabOrder[2]].fields[currentField.name].inputSystems = $scope.fieldConfig[currentField.name].inputSystems;
        }
      }
    });
    
    $scope.$watchCollection('roleTabs[3].currentField.inputSystems.selecteds', function(newValue) {
      if (angular.isDefined(newValue)) {
        var currentField = $scope.roleTabs[0].currentField;
        if (angular.isDefined($scope.configDirty.roleViews[roleTabOrder[3]].fields[currentField.name].inputSystems)) {
          $scope.configDirty.roleViews[roleTabOrder[3]].fields[currentField.name].inputSystems = [];
          angular.forEach(currentField.inputSystems.fieldOrder, function(tag) {
            if (currentField.inputSystems.selecteds[tag]) {
              $scope.configDirty.roleViews[roleTabOrder[3]].fields[currentField.name].inputSystems.push(tag);
            }
          });
        }
      }
    });
    
    $scope.$watch('roleTabs[3].currentField.overrideInputSystems', function(newValue, oldValue) {
      if (angular.isDefined(newValue) && newValue !== oldValue && newValue) {
        var currentField = $scope.roleTabs[3].currentField;
        if (angular.isDefined($scope.configDirty.roleViews[roleTabOrder[3]].fields[currentField.name].inputSystems) &&
            $scope.configDirty.roleViews[roleTabOrder[3]].fields[currentField.name].inputSystems.length <= 0) {
          $scope.configDirty.roleViews[roleTabOrder[3]].fields[currentField.name].inputSystems = $scope.fieldConfig[currentField.name].inputSystems;
        }
      }
    });
    
    $scope.$watchCollection('currentField.inputSystems.selecteds', function(newValue) {
      if (angular.isDefined(newValue)) {
        var role = activeTabRole(),
          currentField;
        if (role) {
          currentField = $scope.roleTabs[$scope.roleTabOrder[role]].currentField;
          if (angular.isDefined($scope.configDirty.roleViews[role].fields[currentField.name].inputSystems)) {
            $scope.configDirty.roleViews[role].fields[currentField.name].inputSystems = [];
            angular.forEach(currentField.inputSystems.fieldOrder, function(tag) {
              if (currentField.inputSystems.selecteds[tag]) {
                $scope.configDirty.roleViews[role].fields[currentField.name].inputSystems.push(tag);
              }
            });
          }
        } else {
          currentField = $scope.userCurrentField[$scope.currentUserId].currentField;
          if (angular.isDefined($scope.configDirty.userViews[$scope.currentUserId].fields[currentField.name].inputSystems)) {
            $scope.configDirty.userViews[$scope.currentUserId].fields[currentField.name].inputSystems = [];
            angular.forEach(currentField.inputSystems.fieldOrder, function(tag) {
              if (currentField.inputSystems.selecteds[tag]) {
                $scope.configDirty.userViews[$scope.currentUserId].fields[currentField.name].inputSystems.push(tag);
              }
            });
          }
        }
      }
    });
    
    $scope.$watch('currentField.overrideInputSystems', function(newValue, oldValue) {
      if (angular.isDefined(newValue) && newValue !== oldValue && newValue) {
        var role = activeTabRole(),
          currentField;
        if (role) {
          currentField = $scope.roleTabs[$scope.roleTabOrder[role]].currentField;
          if (angular.isDefined($scope.configDirty.roleViews[role].fields[currentField.name].inputSystems) &&
              $scope.configDirty.roleViews[role].fields[currentField.name].inputSystems.length <= 0) {
            $scope.configDirty.roleViews[role].fields[currentField.name].inputSystems = $scope.fieldConfig[currentField.name].inputSystems;
          }
        } else {
          currentField = $scope.userCurrentField[$scope.currentUserId].currentField;
          if (angular.isDefined($scope.configDirty.userViews[$scope.currentUserId].fields[currentField.name].inputSystems) &&
              $scope.configDirty.userViews[$scope.currentUserId].fields[currentField.name].inputSystems.length <= 0) {
            $scope.configDirty.userViews[$scope.currentUserId].fields[currentField.name].inputSystems = $scope.fieldConfig[currentField.name].inputSystems;
          }
        }
      }
    });
*/    
  }])
  ;
