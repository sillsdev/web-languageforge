'use strict';

angular.module('sfchecks.projectSettings', ['bellows.services', 'sfchecks.services',
  'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb',
  'palaso.ui.notice', 'palaso.ui.textdrop', 'palaso.ui.jqte', 'palaso.ui.picklistEditor',
  'angularFileUpload', 'ngRoute'])
  .controller('ProjectSettingsCtrl', ['$scope', 'breadcrumbService', 'userService',
    'sfchecksProjectService', 'sessionService', 'silNoticeService', 'messageService',
    'sfchecksLinkService',
  function ($scope, breadcrumbService, userService,
            sfchecksProjectService, ss, notice, messageService,
            sfchecksLinkService) {
    $scope.project = {};
    $scope.finishedLoading = false;
    $scope.show = {};
    $scope.list = {};
    $scope.list.archivedTexts = [];

    $scope.canEditCommunicationSettings = function () {
      return ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
    };

    $scope.queryProjectSettings = function () {
      sfchecksProjectService.projectSettings(function (result) {
        if (result.ok) {
          $scope.project = result.data.project;
          $scope.list.users = result.data.entries;
          $scope.list.userCount = result.data.count;
          $scope.list.archivedTexts = result.data.archivedTexts;
          for (var i = 0; i < $scope.list.archivedTexts.length; i++) {
            $scope.list.archivedTexts[i].url =
              sfchecksLinkService.text($scope.list.archivedTexts[i].id);
            $scope.list.archivedTexts[i].dateModified =
              new Date($scope.list.archivedTexts[i].dateModified);
          }

          // Rights
          var rights = result.data.rights;
          $scope.rights = {};
          $scope.rights.archive = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.ARCHIVE);
          $scope.rights.deleteOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.DELETE);
          $scope.rights.create = ss.hasRight(rights, ss.domain.USERS, ss.operation.CREATE);
          $scope.rights.editOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.EDIT);
          $scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create ||
            $scope.rights.editOther;

          // Breadcrumb
          breadcrumbService.set('top',
              [
               { href: '/app/projects', label: 'My Projects' },
               { href: sfchecksLinkService.project(), label: result.data.bcs.project.crumb },
               { href: sfchecksLinkService.project() + '/settings', label: 'Settings' }
              ]
          );
          $scope.finishedLoading = true;
        }
      });
    };

    $scope.settings = {
      sms: {},
      email: {}
    };

    $scope.readCommunicationSettings = function readCommunicationSettings() {
      sfchecksProjectService.readSettings(function (result) {
        if (result.ok) {
          $scope.settings.sms = result.data.sms;
          $scope.settings.email = result.data.email;
          $scope.finishedLoading = true;
        }
      });
    };

  }])
  .controller('ProjectSettingsQTemplateCtrl', ['$scope', 'silNoticeService',
    'questionTemplateService', function ($scope, notice, qts) {
    $scope.selected = [];
    $scope.vars = {
      selectedIndex: -1
    };
    $scope.updateSelection = function (event, item) {
      var selectedIndex = $scope.selected.indexOf(item);
      var checkbox = event.target;
      if (checkbox.checked && selectedIndex == -1) {
        $scope.selected.push(item);
      } else if (!checkbox.checked && selectedIndex != -1) {
        $scope.selected.splice(selectedIndex, 1);
      }

      $scope.vars.selectedIndex = selectedIndex; // Needed?
    };

    $scope.isSelected = function (item) {
      return item != null && $scope.selected.indexOf(item) >= 0;
    };

    $scope.editTemplateButtonText = 'Add New Template';
    $scope.editTemplateButtonIcon = 'plus';
    $scope.$watch('selected.length', function (newval) {
      if (newval >= 1) {
        $scope.editTemplateButtonText = 'Edit Template';
        $scope.editTemplateButtonIcon = 'pencil';
      } else {
        $scope.editTemplateButtonText = 'Add New Template';
        $scope.editTemplateButtonIcon = 'plus';
      }
    });

    $scope.editedTemplate = {
      id: '',
      title: '',
      description: ''
    };
    $scope.templateEditorVisible = false;
    $scope.showTemplateEditor = function (template) {
      $scope.templateEditorVisible = true;
      if (template) {
        $scope.editedTemplate = template;
      } else {
        $scope.editedTemplate.id = '';
        $scope.editedTemplate.title = '';
        $scope.editedTemplate.description = '';
      }
    };

    $scope.hideTemplateEditor = function () {
      $scope.templateEditorVisible = false;
    };

    $scope.toggleTemplateEditor = function () {
      // Can't just do "visible = !visible" because show() has logic we need to run
      if ($scope.templateEditorVisible) {
        $scope.hideTemplateEditor();
      } else {
        $scope.showTemplateEditor();
      }
    };

    $scope.editTemplate = function () {
      if ($scope.editedTemplate.title && $scope.editedTemplate.description) {
        qts.update($scope.editedTemplate, function (result) {
          if (result.ok) {
            if ($scope.editedTemplate.id) {
              notice.push(notice.SUCCESS, 'The template \'' + $scope.editedTemplate.title +
                '\' was updated successfully');
            } else {
              notice.push(notice.SUCCESS, 'The new template \'' + $scope.editedTemplate.title +
                '\' was added successfully');
            }

            $scope.hideTemplateEditor();
            $scope.selected = [];
            $scope.vars.selectedIndex = -1;
            $scope.queryTemplates(true);
          }
        });
      }
    };

    $scope.templates = [];
    $scope.queryTemplates = function (invalidateCache) {
      var forceReload = (invalidateCache || (!$scope.templates) || ($scope.templates.length == 0));
      if (forceReload) {
        qts.list(function (result) {
          if (result.ok) {
            $scope.templates = result.data.entries;
            $scope.finishedLoading = true;
          } else {
            $scope.templates = [];
          }
        });
      }
    };

    $scope.removeTemplates = function () {
      var templateIds = [];
      for (var i = 0, l = $scope.selected.length; i < l; i++) {
        templateIds.push($scope.selected[i].id);
      }

      if (l == 0) {
        return;
      }

      qts.remove(templateIds, function (result) {
        if (result.ok) {
          if (templateIds.length == 1) {
            notice.push(notice.SUCCESS, 'The template was removed successfully');
          } else {
            notice.push(notice.SUCCESS, 'The templates were removed successfully');
          }

          $scope.selected = [];
          $scope.vars.selectedIndex = -1;
          $scope.queryTemplates(true);
        }
      });
    };

  }])
  .controller('ProjectSettingsArchiveTextsCtrl', ['$scope', 'textService', 'silNoticeService',
  function ($scope, textService, notice) {
    // Listview Selection
    $scope.selected = [];
    $scope.updateSelection = function (event, item) {
      var selectedIndex = $scope.selected.indexOf(item);
      var checkbox = event.target;
      if (checkbox.checked && selectedIndex == -1) {
        $scope.selected.push(item);
      } else if (!checkbox.checked && selectedIndex != -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function (item) {
      return item != null && $scope.selected.indexOf(item) >= 0;
    };

    // Publish Texts
    $scope.publishTexts = function () {
      var textIds = [];
      for (var i = 0, l = $scope.selected.length; i < l; i++) {
        textIds.push($scope.selected[i].id);
      }

      textService.publish(textIds, function (result) {
        if (result.ok) {
          $scope.selected = []; // Reset the selection
          $scope.queryProjectSettings();
          if (textIds.length == 1) {
            notice.push(notice.SUCCESS, 'The text was re-published successfully');
          } else {
            notice.push(notice.SUCCESS, 'The texts were re-published successfully');
          }
        }
      });
    };

  }])
  .controller('ProjectSettingsCommunicationCtrl', ['$scope', 'userService',
    'sfchecksProjectService', 'sessionService', 'silNoticeService',
  function ($scope, userService,
            sfchecksProjectService, ss, notice) {
    $scope.updateCommunicationSettings = function () {
      sfchecksProjectService.updateSettings($scope.settings.sms, $scope.settings.email,
      function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $scope.project.projectName +
            ' SMS settings updated successfully');
        }
      });
    };

  }])
  .controller('ProjectSettingsPropertiesCtrl', ['$scope', 'userService', 'sfchecksProjectService',
    'sessionService', 'silNoticeService',
  function ($scope, userService, sfchecksProjectService,
            ss, notice) {

    // TODO This can be moved to the page level controller, it is common with the Setup tab.
    $scope.updateProject = function () {
      var project = angular.copy($scope.project);
      delete project.ownerRef; // ownerRef is expected as string id not array of id and username
      sfchecksProjectService.update(project, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $scope.project.projectName +
            ' settings updated successfully');
        }
      });
    };

  }])
  .controller('ProjectSettingsSetupCtrl', ['$scope', 'userService', 'sfchecksProjectService',
    'sessionService', 'silNoticeService',
  function ($scope, userService, sfchecksProjectService,
            ss, notice) {

    // TODO This can be moved to the page level controller, it is common with the Setup tab.
    $scope.currentListsEnabled = [];
    $scope.updateProject = function () {
      // populate the list of enabled user profile properties
      $scope.project.userProperties.userProfilePropertiesEnabled = [];
      for (var listId in $scope.currentListsEnabled) {
        if ($scope.currentListsEnabled.hasOwnProperty(listId) &&
            $scope.currentListsEnabled[listId]) {
          $scope.project.userProperties.userProfilePropertiesEnabled.push(listId);
        }
      }

      var project = angular.copy($scope.project);
      delete project.ownerRef; // ownerRef is expected as string id not array of id and username
      sfchecksProjectService.update(project, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $scope.project.projectName +
            ' settings updated successfully');
        }
      });

      $scope.unsavedChanges = false;
      $scope.startWatchingPicklists();
    };

    $scope.currentListId = '';
    $scope.selectList = function (listId) {
      $scope.currentListId = listId;
    };

    $scope.picklistWatcher = function (newval, oldval) {
      if (angular.isDefined(newval) && newval != oldval) {
        $scope.unsavedChanges = true;

        // Since a values watch is expensive, stop watching after first time data changes
        $scope.stopWatchingPicklists();
      }
    };

    $scope.stopWatchingPicklists = function () {
      if ($scope.deregisterPicklistWatcher) {
        $scope.deregisterPicklistWatcher();
        $scope.deregisterPicklistWatcher = undefined;
      }
    };

    $scope.startWatchingPicklists = function () {
      $scope.stopWatchingPicklists(); // Ensure we never register two expensive watches at once
      $scope.deregisterPicklistWatcher =
        $scope.$watch('project.userProperties.userProfilePickLists', $scope.picklistWatcher, true);
    };

    $scope.$watch('project.userProperties', function (newValue) {
      if (newValue != undefined) {
        for (var key in newValue.userProfilePickLists) {
          $scope.currentListId = key;
          break;
        }

        $scope.currentListsEnabled = {};
        var userProfilePropertiesEnabled =
          $scope.project.userProperties.userProfilePropertiesEnabled;
        for (var i = 0; i < userProfilePropertiesEnabled.length; i++) {
          $scope.currentListsEnabled[userProfilePropertiesEnabled[i]] = true;
        }
      }

      $scope.startWatchingPicklists();
    });

  }])
  .controller('ProjectSettingsUsersCtrl', ['$scope', 'userService', 'projectService',
    'sessionService', 'silNoticeService', 'messageService',
  function ($scope, userService, projectService,
            ss, notice, messageService) {
    $scope.userFilter = '';
    $scope.message = {};
    $scope.newMessageCollapsed = true;

    $scope.readCommunicationSettings();

    // jqte options for html email message composition
    $scope.jqteOptions = {
      placeholder: 'Email Message',
      u: false,
      indent: false,
      outdent: false,
      left: false,
      center: false,
      right: false,
      rule: false,
      source: false,
      link: false,
      unlink: false,
      fsize: false,
      sub: false,
      color: false,
      format: false,
      formats: [
        ['p', 'Normal'],
        ['h4', 'Large']
      ]
    };

    $scope.show.messaging = function showMessaging() {
      return !!($scope.settings.email.fromAddress);
    };

    $scope.sendMessageToSelectedUsers = function () {
      if ($scope.selected.length == 0) {
        $scope.messagingWarning = 'Select at least one member to message';
        return;
      }

      var userIds = [];
      for (var i = 0, l = $scope.selected.length; i < l; i++) {
        userIds.push($scope.selected[i].id);
      }

      messageService.send(userIds, $scope.message.subject, $scope.message.emailTemplate,
        $scope.message.smsTemplate, function (result) {
        if (result.ok) {
          $scope.message.subject = '';
          $scope.message.emailTemplate = '';
          $scope.message.smsTemplate = '';
          $scope.selected = [];
          $scope.newMessageCollapsed = true;
          notice.push(notice.SUCCESS, 'The message was successfully queued for sending');
        }
      });
    };

    // ----------------------------------------------------------
    // List
    // ----------------------------------------------------------
    $scope.selected = [];
    $scope.updateSelection = function (event, item) {
      var selectedIndex = $scope.selected.indexOf(item);
      var checkbox = event.target;
      if (checkbox.checked) {
        $scope.messagingWarning = '';
      }

      if (checkbox.checked && selectedIndex == -1) {
        $scope.selected.push(item);
      } else if (!checkbox.checked && selectedIndex != -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function (item) {
      return item != null && $scope.selected.indexOf(item) >= 0;
    };

    $scope.removeProjectUsers = function () {
      var userIds = [];
      for (var i = 0, l = $scope.selected.length; i < l; i++) {

        // Guard against project owner being removed
        if ($scope.selected[i].id != $scope.project.ownerRef.id) {
          userIds.push($scope.selected[i].id);
        } else {
          notice.push(notice.WARN, 'Project owner cannot be removed');
        }
      }

      if (l == 0) {

        // TODO ERROR
        return;
      }

      projectService.removeUsers(userIds, function (result) {
        if (result.ok) {
          $scope.queryProjectSettings();
          $scope.selected = [];
          if (userIds.length == 1) {
            notice.push(notice.SUCCESS, 'The user was removed from this project');
          } else {
            notice.push(notice.SUCCESS, userIds.length + ' users were removed from this project');
          }
        }
      });
    };

    // Roles in list
    $scope.roles = [
          { key: 'contributor', name: 'Contributor' },
          { key: 'project_manager', name: 'Manager' }
      ];

    $scope.onRoleChange = function (user) {
      projectService.updateUserRole(user.id, user.role, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, user.username + '\'s role was changed to ' + user.role);
        }
      });
    };

    // ----------------------------------------------------------
    // Typeahead
    // ----------------------------------------------------------
    $scope.users = [];
    $scope.addModes = {
        addNew: { en: 'Create New User', icon: 'icon-user' },
        addExisting: { en: 'Add Existing User', icon: 'icon-user' },
        invite: { en: 'Send Email Invite', icon: 'icon-envelope' }
      };
    $scope.addMode = 'addNew';
    $scope.disableAddButton = true;
    $scope.typeahead = {};
    $scope.typeahead.userName = '';

    $scope.queryUser = function (userName) {
      userService.typeaheadExclusive(userName, $scope.project.id, function (result) {
        // TODO Check userName == controller view value (cf bootstrap typeahead) else abandon.
        if (result.ok) {
          $scope.users = result.data.entries;
          if (result.data.excludedUsers) {
            $scope.excludedUsers = result.data.excludedUsers.entries;
          } else {
            $scope.excludedUsers = [];
          }

          $scope.updateAddMode();
        }
      });
    };

    $scope.addModeText = function (addMode) {
      return $scope.addModes[addMode].en;
    };

    $scope.addModeIcon = function (addMode) {
      return $scope.addModes[addMode].icon;
    };

    $scope.updateAddMode = function (newMode) {
      if (newMode in $scope.addModes) {
        $scope.addMode = newMode;
      } else {
        // This also covers the case where newMode is undefined
        $scope.calculateAddMode();
      }
    };

    $scope.isExcludedUser = function (userName) {
      // Is this userName in the "excluded users" list? (I.e., users already in current project)
      // Note that it's not enough to check whether the "excluded users" list is non-empty,
      // as the "excluded users" list might include some users that had a partial match on
      // the given username. E.g. when creating a new user Bob Jones with username "bjones",
      // after typing "bjo" the "excluded users" list will include Bob Johnson (bjohnson).
      if (!$scope.excludedUsers) { return false; }

      for (var i = 0, l = $scope.excludedUsers.length; i < l; i++) {
        if (userName == $scope.excludedUsers[i].username ||
          userName == $scope.excludedUsers[i].name     ||
          userName == $scope.excludedUsers[i].email) {
          return $scope.excludedUsers[i];
        }
      }

      return false;
    };

    $scope.calculateAddMode = function () {
      // TODO This isn't adequate. Need to watch the 'typeahead.userName' and 'selection' also.
      // CP 2013-07
      if (!$scope.typeahead.userName) {
        $scope.addMode = 'addNew';
        $scope.disableAddButton = true;
        $scope.warningText = '';
      } else if ($scope.isExcludedUser($scope.typeahead.userName)) {
        var excludedUser = $scope.isExcludedUser($scope.typeahead.userName);
        $scope.addMode = 'addExisting';
        $scope.disableAddButton = true;
        $scope.warningText = excludedUser.name +
                             ' (username \'' + excludedUser.username +
                             '\', email ' + excludedUser.email +
                             ') is already a member.';
      } else if ($scope.typeahead.userName.indexOf('@') != -1) {
        $scope.addMode = 'invite';
        $scope.disableAddButton = false;
        $scope.warningText = '';
      } else if ($scope.users.length == 0) {
        $scope.addMode = 'addNew';
        $scope.disableAddButton = false;
        $scope.warningText = '';
      } else {
        $scope.addMode = 'addExisting';
        $scope.disableAddButton = false;
        $scope.warningText = '';
      }
    };

    $scope.addProjectUser = function () {
      if ($scope.addMode == 'addNew') {
        userService.createSimple($scope.typeahead.userName, function (result) {
          if (result.ok) {
            notice.push(notice.INFO, 'User created.  Username: ' + $scope.typeahead.userName +
              '    Password: ' + result.data.password);
            $scope.queryProjectSettings();
          }
        });
      } else if ($scope.addMode == 'addExisting') {
        var model = {};
        model.id = $scope.user.id;

        // Check existing users to see if we're adding someone that already exists in the project
        projectService.users(function (result) {
          if (result.ok) {
            for (var i = 0, l = result.data.users.length; i < l; i++) {
              // This approach works, but is unnecessarily slow. We should have an "is user in
              // project?" API, rather than returning all users then searching through them in
              // O(N) time.
              // TODO: Make an "is user in project?" query API. 2014-06 RM
              var thisUser = result.data.users[i];
              if (thisUser.id == model.id) {
                notice.push(notice.WARN, '\'' + $scope.user.name + '\' is already a member of ' +
                  $scope.project.projectName + '.');
                return;
              }
            }

            projectService.updateUserRole($scope.user.id, 'contributor', function (result) {
              if (result.ok) {
                notice.push(notice.SUCCESS, '\'' + $scope.user.name + '\' was added to ' +
                  $scope.project.projectName + ' successfully');
                $scope.queryProjectSettings();
              }
            });
          }
        });
      } else if ($scope.addMode == 'invite') {
        userService.sendInvite($scope.typeahead.userName, function (result) {
          if (result.ok) {
            notice.push(notice.SUCCESS, '\'' + $scope.typeahead.userName +
              '\' was invited to join the project ' + $scope.project.projectName);
            $scope.queryProjectSettings();
          }
        });
      }
    };

    $scope.selectUser = function (item) {
      if (item) {
        $scope.user = item;
        $scope.typeahead.userName = item.name;
        $scope.updateAddMode('addExisting');
      }
    };

    $scope.imageSource = function (avatarRef) {
      return avatarRef ? '/Site/views/shared/image/avatar/' + avatarRef :
        '/Site/views/shared/image/avatar/anonymous02.png';
    };

  }])

  ;
