'use strict';

angular.module('lexicon.view.settings', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'lexicon.services'])
  .controller('ViewSettingsCtrl', ['$scope', 'silNoticeService', 'userService', 'lexProjectService', 'sessionService', '$filter', '$modal', 'lexConfigService',
  function ViewSettingsCtrl($scope, notice, userService, lexProjectService, ss, $filter, $modal, lexConfigService) {
    lexProjectService.setBreadcrumbs('viewSettings', $filter('translate')('View Settings'));

    // ViewModel for input systems selectors
    var InputSystemsViewModel = function(allTags, selectedTags) {
      // allTags and selectedTags should be lists of tag names, like ['th', 'en']
      if (angular.isUndefined(allTags)) { allTags = []; }
      if (angular.isUndefined(selectedTags)) { selectedTags = []; }
      if (!angular.isArray(allTags)) { allTags = Object.keys(allTags); }
      if (!angular.isArray(selectedTags)) { selectedTags = Object.keys(selectedTags); }

      this.selected = {};
      this.order = [];
      this.currentTag = '';

      angular.forEach(selectedTags, this.select, this);
      // Order presented to user should be all selected tags first, then unselected ones
      this.order = angular.copy(selectedTags);
      angular.forEach(allTags, function(tag) {
        if (!this.selected[tag]) {
          this.order.push(tag);
        }
      }, this);
    };

    InputSystemsViewModel.prototype.getSelectedTags = function getSelectedTags() {
      return this.order.filter(function(tag) { return this.selected[tag]; }, this);
    };

    InputSystemsViewModel.prototype.select = function select(tag) {
      this.selected[tag] = true;
    };
    InputSystemsViewModel.prototype.deselect = function deselect(tag) {
      this.selected[tag] = false;
    };
    InputSystemsViewModel.prototype.toggle = function toggle(tag) {
      // Will set selected[tag] to true if it was undefined
      this.selected[tag] = !this.selected[tag];
    };

    InputSystemsViewModel.prototype._swapTagIndices = function _swapTagIndices(idx1, idx2) {
      // Used internally by moveTagUp() and moveTagDown(). Does NO bounds checking.
      var tmp = this.order[idx1];
      this.order[idx1] = this.order[idx2];
      this.order[idx2] = tmp;
    };
    InputSystemsViewModel.prototype.moveTagUp = function moveTagUp(tag) {
      var idx = this.order.indexOf(tag);
      if (idx > 0 && idx < this.order.length) {
        this._swapTagIndices(idx, idx-1);
      }
    };
    InputSystemsViewModel.prototype.moveTagDown = function moveTagDown(tag) {
      var idx = this.order.indexOf(tag);
      if (idx >= 0 && idx < this.order.length-1) {
        this._swapTagIndices(idx, idx+1);
      }
    };

    $scope.selectUser = function selectUser(userId) {
      $scope.currentUserId = userId;
      $scope.state = 'userSettings';
      $scope.currentView = $scope.configDirty.userViews[userId];
      var user = $scope.usersWithSettings[userId];
      if (user) {
        $scope.forWhom = user.name + ' (' + user.username + ')';;
      } else {
        $scope.forWhom = '(unknown user)';
      }
//      $scope.viewSettingForm.$setDirty(); // TODO: Determine if this is really needed - I think not. 2014-09-22 RM
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
      }$scope.currentField.inputSystems = {};
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
      $scope.currentTab = $scope.tabs[idx];
      if ($scope.currentTab.byRole) {
        $scope.forWhom = $scope.currentTab.name;
        $scope.currentView = $scope.currentTab.view;
      } else {
        var user = $scope.typeahead.user;
        if (user) {
          // Existing user, so there was already a view
          $scope.forWhom = user.name + ' (' + user.username + ')';
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
          entry: config.entry.fieldOrder.filter(function(field) { return field.type !== 'fields'; }),
          senses: config.entry.fields.senses.fieldOrder.filter(function(field) { return field.type !== 'fields'; }),
          examples: config.entry.fields.senses.fields.examples.fieldOrder.filter(function(field) { return field.type !== 'fields'; }),
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

    $scope.currentField = {
      'name': '',
      'inputSystems': {
        'fieldOrder': [],
        'selecteds': {}
      }
    };
    $scope.selectField = function selectField(fieldName, view) {
      $scope.currentField.name = fieldName;
      if (angular.isDefined(view) && angular.isDefined(view.fields[fieldName].overrideInputSystems)) {
        if (angular.isDefined(view.fields[fieldName].inputSystems) &&
            view.fields[fieldName].inputSystems.length > 0) {
          // Do nothing; use existing value of inputSystems for this field
        } else {
          // Default input systems for any field is all available (found in config)
          view.fields[fieldName].inputSystems = $scope.fieldConfig[fieldName].inputSystems;
        }
        $scope.currentField.inputSystems = new InputSystemsViewModel(
            $scope.configDirty.inputSystems,
            view.fields[fieldName].inputSystems
        );
      } else {
        $scope.currentField.inputSystems = new InputSystemsViewModel();
      }
    };
    $scope.selectField('lexeme', $scope.tabs[0].view);

    $scope.moveUp = function moveUp(currentTag, view) {
      $scope.currentField.inputSystems.moveTagUp(currentTag);
      view.fields[$scope.currentField.name].inputSystems = $scope.currentField.inputSystems.getSelectedTags();
      $scope.viewSettingForm.$setDirty();
    };
    $scope.moveDown = function moveDown(currentTag, view) {
      $scope.currentField.inputSystems.moveTagDown(currentTag);
      view.fields[$scope.currentField.name].inputSystems = $scope.currentField.inputSystems.getSelectedTags();
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
      if (!view || !view.fields) return false;
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

    $scope.$watchCollection('currentField.inputSystems.selected', function watchCurrentInputSystems(newValue) {
      if (angular.isDefined(newValue)) {
        var view = $scope.currentView,
            field = $scope.currentField;
        if (angular.isDefined(view) && angular.isDefined(field)) {
          view.fields[field.name].inputSystems = field.inputSystems.getSelectedTags();
        }
      }
    });

  }])
  ;

