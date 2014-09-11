'use strict';

angular.module('lexicon.view.settings', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'lexicon.services'])
  .controller('ViewSettingsCtrl', ['$scope', 'silNoticeService', 'userService', 'lexProjectService', 'sessionService', '$filter', '$modal', 'lexConfigService',
  function ViewSettingsCtrl($scope, notice, userService, lexProjectService, ss, $filter, $modal, lexConfigService) {
    lexProjectService.setBreadcrumbs('viewSettings', $filter('translate')('View Settings'));

    $scope.selectUser = function selectUser(userId) {
      $scope.currentUserId = userId;
      $scope.state = 'userSettings';
    };

    $scope.configDirty = angular.copy($scope.projectSettings.config);
//    console.log("Original config:", $scope.projectSettings.config);
//    console.log("Modified config:", $scope.configDirty);

    // Typeahead for user selection
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
        $scope.forWhom = user.name + ' (' + user.username + ')';
        deleteFromArray(user, 'id', $scope.usersWithoutSettings);
        $scope.usersWithSettings[user.id] = user;
        $scope.configDirty.userViews[user.id] = userView;
        $scope.currentView = $scope.configDirty.userViews[user.id];
        $scope.typeahead.userName = '';
        $scope.viewSettingForm.$setDirty();
      }
    };

    $scope.tabs = [
      {byRole: true, byUser: false, name: $filter('translate')('Observer'), role: 'observer', view: $scope.configDirty.roleViews['observer'], active: true},
      {byRole: true, byUser: false, name: $filter('translate')('Commenter'), role: 'observer_with_comment', view: $scope.configDirty.roleViews['observer_with_comment']},
      {byRole: true, byUser: false, name: $filter('translate')('Contributor'), role: 'contributor', view: $scope.configDirty.roleViews['contributor']},
      {byRole: true, byUser: false, name: $filter('translate')('Manager'), role: 'project_manager', view: $scope.configDirty.roleViews['project_manager']},
      {byRole: false, byUser: true, name: $filter('translate')('Member Specific'), role: undefined, view: undefined}
    ];
    $scope.state = 'userSelectList';
    $scope.isSaving = false;
    $scope.list = {};

    $scope.selectTab = function(idx) {
      console.log('Selecting role', idx);
      $scope.currentTab = $scope.tabs[idx];
      if ($scope.currentTab.byRole) {
        $scope.forWhom = $scope.currentTab.name;
        $scope.currentView = $scope.currentTab.view;
      } else {
        var user = $scope.typeahead.user;
        if (user) {
          // Existing user, so there was already a view
          $scope.forWhom = user.name;
          $scope.currentView = $scope.configDirty.userViews[user.id];
        } else {
          // View will be created when addUser() is called
          $scope.forWhom = $filter('translate')("(choose a user)"); // Should be hidden, but just in case
          $scope.currentView = {};
        }
      }
    };
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

    // $scope.fieldConfig, fieldOrder, and customFieldOrder will be read-only copies
    // of the config, so the view doesn't need to dig too deeply into config.entry.foo.bar.baz.quux
    $scope.getFieldConfig = function getFieldConfig(config) {
      $scope.fieldConfig = {};
      function getFields(section, isCustom) {
        // Sanity check
        if (angular.isUndefined(section) || angular.isUndefined(section.fieldOrder) || angular.isUndefined(section.fields)) {
          return;
        }
        angular.forEach(section.fieldOrder, function(fieldName) {
          var field = section.fields[fieldName];
          if (angular.isDefined(field) && field.type !== 'fields') {
            $scope.fieldConfig[fieldName] = field;
          }
        });
      };
      getFields(config.entry);
      getFields(config.entry.fields.senses);
      getFields(config.entry.fields.senses.fields.examples);
      getFields(config.entry.fields.customFields);
      getFields(config.entry.fields.senses.customFields);
      getFields(config.entry.fields.senses.fields.examples.customFields);
      $scope.fieldOrder = {
          entry: config.entry.fieldOrder,
          senses: config.entry.fields.senses.fieldOrder,
          examples: config.entry.fields.senses.fields.examples.fieldOrder,
      };
    };
    $scope.getFieldConfig($scope.configDirty);

    $scope.settingsApply = function settingsApply() {
      $scope.isSaving = true;
      lexProjectService.updateConfiguration($scope.configDirty, [], function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $filter('translate')('View settings updated successfully'));
          $scope.viewSettingForm.$setPristine();
          $scope.projectSettings.config = angular.copy($scope.configDirty);
        }
        $scope.isSaving = false;
      });
    };

    function createCurrentInputSystems(inputSystems) {
      angular.forEach(inputSystems, function(tag) {
        $scope.currentField.inputSystems.selecteds[tag] = true;
      });

      // if the field uses input systems, add the selected systems first then the unselected systems
      if (inputSystems) {
        $scope.currentField.inputSystems.fieldOrder = inputSystems;
        angular.forEach($scope.configDirty.inputSystems, function(inputSystem, tag) {
          if (! (tag in $scope.currentField.inputSystems.selecteds) &&
              $scope.currentField.inputSystems.fieldOrder.indexOf(tag) == -1) {
            $scope.currentField.inputSystems.fieldOrder.push(tag);
          }
        });
      }
    }

    $scope.currentField = {
      'name': '',
      'inputSystems': {
        'fieldOrder': [],
        'selecteds': {}
      }
    };
    $scope.selectField = function selectField(fieldName, view) {
      $scope.currentField.name = fieldName;
      $scope.currentField.inputSystems.selecteds = {};
      if (angular.isDefined(view) && angular.isDefined(view.fields[fieldName].overrideInputSystems)) {
        if (angular.isDefined(view.fields[fieldName].inputSystems)) {
          if (view.fields[fieldName].inputSystems.length <= 0) {
            view.fields[fieldName].inputSystems = $scope.fieldConfig[fieldName].inputSystems;
          }
        } else {
          view.fields[fieldName].inputSystems = $scope.fieldConfig[fieldName].inputSystems;
        }
        createCurrentInputSystems(view.fields[fieldName].inputSystems);
      }
    };
    $scope.selectField('lexeme', $scope.tabs[0].view);

    $scope.moveUp = function moveUp(currentTag, view) {
      var currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1];
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1] = currentTag;
      view.fields[$scope.currentField.name].inputSystems = [];
      angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
        if ($scope.currentField.inputSystems.selecteds[tag]) {
          view.fields[$scope.currentField.name].inputSystems.push(tag);
        }
      });
      $scope.viewSettingForm.$setDirty();
    };
    $scope.moveDown = function moveDown(currentTag, view) {
      var currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1];
      $scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1] = currentTag;
      view.fields[$scope.currentField.name].inputSystems = [];
      angular.forEach($scope.currentField.inputSystems.fieldOrder, function(tag) {
        if ($scope.currentField.inputSystems.selecteds[tag]) {
          view.fields[$scope.currentField.name].inputSystems.push(tag);
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
      angular.forEach($scope.tabs, function(tab) {
        if (tab.byRole) {
          atLeastOne = atLeastOne && $scope.isAtLeastOneSense(tab.view);
        }
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

    $scope.imageSource = function imageSource(avatarRef) {
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
      var active = $scope.tabs.filter(function(tab) {
          return tab.active;
        })[0];
      if (angular.isUndefined(active)) return false;
      return active.role;
    };

    $scope.$watchCollection('currentField.inputSystems.selecteds', function watchCurrentSelecteds(newValue) {
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
          if ($scope.currentUserId && angular.isDefined($scope.configDirty.userViews[$scope.currentUserId].fields[$scope.currentField.name].inputSystems)) {
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

