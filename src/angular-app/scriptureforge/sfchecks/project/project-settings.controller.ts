import * as angular from 'angular';

import {JsonRpcResult} from '../../../bellows/core/api/json-rpc.service';
import {BreadcrumbModule} from '../../../bellows/core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {Session, SessionService} from '../../../bellows/core/session.service';
import {DeleteProjectModule} from '../../../bellows/shared/delete-project.component';
import {ListViewModule} from '../../../bellows/shared/list-view.component';
import {User} from '../../../bellows/shared/model/user.model';
import {PickListEditorModule} from '../../../bellows/shared/pick-list-editor.module';
import {TabSetModule} from '../../../bellows/shared/tabset.module';
import {TypeAheadModule} from '../../../bellows/shared/type-ahead.module';
import {SfChecksCoreModule} from '../core/sf-checks-core.module';
import {QuestionTemplate} from '../shared/model/text.model';
import {UserProfilePickLists, UserProperties} from '../shared/model/user-properties.model';
import {RunReportModule} from './run-report.component';

export const SfChecksProjectSettingsModule = angular
  .module('sfchecks.projectSettings', [
    BreadcrumbModule,
    CoreModule,
    DeleteProjectModule,
    ListViewModule,
    NoticeModule,
    PickListEditorModule,
    RunReportModule,
    TabSetModule,
    TypeAheadModule,
    SfChecksCoreModule
  ])
  .controller('ProjectSettingsCtrl', ['$scope', '$q', 'breadcrumbService', 'userService',
    'sfchecksProjectService', 'sessionService', 'silNoticeService', 'messageService', 'linkService',
  ($scope, $q, breadcrumbService, userService,
   sfchecksProjectService, sessionService: SessionService, notice, messageService, linkService) => {

    $scope.project = {};
    $scope.finishedLoading = false;
    $scope.show = {};
    $scope.list = {};
    $scope.list.archivedTexts = [];

    $scope.queryProjectSettings = function queryProjectSettings() {
      $q.all([sessionService.getSession(), sfchecksProjectService.projectSettings()]).then((data: any[]) => {
        const session = data[0] as Session;
        const result = data[1] as JsonRpcResult<any>;
        $scope.project = result.data.project;
        $scope.list.users = result.data.entries;
        $scope.list.userCount = result.data.count;
        $scope.list.archivedTexts = result.data.archivedTexts;
        for (const archivedText of $scope.list.archivedTexts) {
          archivedText.url = linkService.text(archivedText.id);
          archivedText.dateModified = new Date(archivedText.dateModified);
        }

        // Rights
        const rights = result.data.rights;
        $scope.rights = {};
        $scope.rights.archive = session.hasRight(rights, sessionService.domain.TEXTS, sessionService.operation.ARCHIVE);
        $scope.rights.deleteOther =
          session.hasRight(rights, sessionService.domain.USERS, sessionService.operation.DELETE);
        $scope.rights.create = session.hasRight(rights, sessionService.domain.USERS, sessionService.operation.CREATE);
        $scope.rights.editOther = session.hasRight(rights, sessionService.domain.USERS, sessionService.operation.EDIT);
        $scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
        $scope.rights.remove = session.project().userIsProjectOwner ||
          session.hasSiteRight(sessionService.domain.PROJECTS, sessionService.operation.DELETE);

        breadcrumbService.set('top', [
          { href: '/app/projects', label: 'My Projects' },
          { href: linkService.project(), label: result.data.bcs.project.crumb },
          { href: linkService.project() + '/settings', label: 'Settings' }
        ]);
        $scope.finishedLoading = true;
      });
    };

    $scope.settings = {
      sms: {},
      email: {}
    };

    $scope.readCommunicationSettings = function readCommunicationSettings() {
      sfchecksProjectService.readSettings().then((result: JsonRpcResult<any>) => {
        if (result.ok) {
          $scope.settings.sms = result.data.sms;
          $scope.settings.email = result.data.email;
          $scope.finishedLoading = true;
        }
      });
    };

  }])
  .controller('ProjectSettingsQTemplateCtrl', ['$scope', 'silNoticeService', 'questionTemplateService',
  ($scope, notice, qts) => {

    $scope.selected = [];
    $scope.vars = {
      selectedIndex: -1
    };
    $scope.updateSelection = function updateSelection(event: Event, questionTemplate: QuestionTemplate): void {
      const selectedIndex = $scope.selected.indexOf(questionTemplate);
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.checked && selectedIndex === -1) {
        $scope.selected.push(questionTemplate);
      } else if (!checkbox.checked && selectedIndex !== -1) {
        $scope.selected.splice(selectedIndex, 1);
      }

      $scope.vars.selectedIndex = selectedIndex; // Needed?
    };

    $scope.isSelected = function isSelected(questionTemplate: QuestionTemplate): boolean {
      return questionTemplate !== null && $scope.selected.includes(questionTemplate);
    };

    $scope.editTemplateButtonText = 'Add New Template';
    $scope.editTemplateButtonIcon = 'plus';
    $scope.$watch('selected.length', (newVal: number) => {
      if (newVal >= 1) {
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
    $scope.showTemplateEditor = function showTemplateEditor(template: QuestionTemplate): void {
      $scope.templateEditorVisible = true;
      if (template) {
        $scope.editedTemplate = template;
      } else {
        $scope.editedTemplate.id = '';
        $scope.editedTemplate.title = '';
        $scope.editedTemplate.description = '';
      }
    };

    $scope.hideTemplateEditor = function hideTemplateEditor(): void {
      $scope.templateEditorVisible = false;
    };

    $scope.toggleTemplateEditor = function toggleTemplateEditor(): void {
      // Can't just do "visible = !visible" because show() has logic we need to run
      if ($scope.templateEditorVisible) {
        $scope.hideTemplateEditor();
      } else {
        $scope.showTemplateEditor();
      }
    };

    $scope.editTemplate = function editTemplate(): void {
      if ($scope.editedTemplate.title && $scope.editedTemplate.description) {
        qts.update($scope.editedTemplate).then((result: JsonRpcResult<any>) => {
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
    $scope.queryTemplates = function queryTemplates(invalidateCache: boolean): void {
      const forceReload = (invalidateCache || (!$scope.templates) || ($scope.templates.length === 0));
      if (forceReload) {
        qts.list().then((result: JsonRpcResult<any>) => {
          if (result.ok) {
            $scope.templates = result.data.entries;
            $scope.finishedLoading = true;
          } else {
            $scope.templates = [];
          }
        });
      }
    };

    $scope.removeTemplates = function removeTemplates(): void {
      const templateIds: string[] = [];
      if ($scope.selected.length === 0) {
        return;
      }

      for (const user of $scope.selected) {
        templateIds.push(user.id);
      }

      qts.remove(templateIds).then((result: JsonRpcResult<any>) => {
        if (result.ok) {
          if (templateIds.length === 1) {
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
  ($scope, textService, notice) => {

    // Listview Selection
    $scope.selected = [];
    $scope.updateSelection = function updateSelection(event: Event, text: Text): void {
      const selectedIndex = $scope.selected.indexOf(text);
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.checked && selectedIndex === -1) {
        $scope.selected.push(text);
      } else if (!checkbox.checked && selectedIndex !== -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function isSelected(text: Text): boolean {
      return text != null && $scope.selected.includes(text);
    };

    // Publish Texts
    $scope.publishTexts = function publishTexts(): void {
      const textIds: string[] = [];
      for (const user of $scope.selected) {
        textIds.push(user.id);
      }

      textService.publish(textIds).then((result: JsonRpcResult<any>) => {
        if (result.ok) {
          $scope.selected = []; // Reset the selection
          $scope.queryProjectSettings();
          if (textIds.length === 1) {
            notice.push(notice.SUCCESS, 'The text was re-published successfully');
          } else {
            notice.push(notice.SUCCESS, 'The texts were re-published successfully');
          }
        }
      });
    };

  }])
  .controller('ProjectSettingsCommunicationCtrl', ['$scope', 'sfchecksProjectService', 'silNoticeService',
  ($scope, sfchecksProjectService, notice) => {

    $scope.updateCommunicationSettings = function updateCommunicationSettings(): void {
      sfchecksProjectService.updateSettings($scope.settings.sms, $scope.settings.email)
        .then((result: JsonRpcResult<any>) => {
          if (result.ok) {
            notice.push(notice.SUCCESS, $scope.project.projectName + ' SMS settings updated successfully');
          }
        });
    };

  }])
  .controller('ProjectSettingsPropertiesCtrl', ['$scope', 'sfchecksProjectService', 'silNoticeService',
  ($scope, sfchecksProjectService, notice) => {

    // TODO This can be moved to the page level controller, it is common with the Setup tab.
    $scope.updateProject = function updateProject(): void {
      const project = angular.copy($scope.project);
      if (project.hasOwnProperty('ownerRef')) {
        delete project.ownerRef; // ownerRef is expected as string id not array of id and username
      }

      sfchecksProjectService.update(project).then((result: JsonRpcResult<any>) => {
        if (result.ok) {
          notice.push(notice.SUCCESS, $scope.project.projectName + ' settings updated successfully');
        }
      });
    };

  }])
  .controller('ProjectSettingsSetupCtrl', ['$scope', 'sfchecksProjectService', 'silNoticeService',
  ($scope, sfchecksProjectService, notice) => {

    let deregisterPickListWatcher: () => void;

    // TODO This can be moved to the page level controller, it is common with the Setup tab.
    $scope.currentListsEnabled = [];
    $scope.updateProject = function updateProject(): void {
      // populate the list of enabled user profile properties
      $scope.project.userProperties.userProfilePropertiesEnabled = [];
      for (const listId of Object.keys($scope.currentListsEnabled)) {
        if ($scope.currentListsEnabled[listId] ) {
          $scope.project.userProperties.userProfilePropertiesEnabled.push(listId);
        }
      }

      const project = angular.copy($scope.project);
      if (project.hasOwnProperty('ownerRef')) {
        delete project.ownerRef; // ownerRef is expected as string id not array of id and username
      }

      sfchecksProjectService.update(project).then((result: JsonRpcResult<any>) => {
        if (result.ok) {
          notice.push(notice.SUCCESS, project.projectName + ' settings updated successfully');
        }
      });

      $scope.unsavedChanges = false;
      startWatchingPickLists();
    };

    $scope.currentListId = '';
    $scope.selectList = function selectList(listId: string): void {
      $scope.currentListId = listId;
    };

    function pickListWatcher(newVal: UserProfilePickLists, oldVal: UserProfilePickLists): void {
      if (newVal != null && newVal !== oldVal) {
        $scope.unsavedChanges = true;

        // Since a values watch is expensive, stop watching after first time data changes
        stopWatchingPickLists();
      }
    }

    function stopWatchingPickLists(): void {
      if (deregisterPickListWatcher) {
        deregisterPickListWatcher();
        deregisterPickListWatcher = undefined;
      }
    }

    function startWatchingPickLists(): void {
      stopWatchingPickLists(); // Ensure we never register two expensive watches at once
      deregisterPickListWatcher = $scope.$watch('project.userProperties.userProfilePickLists', pickListWatcher, true);
    }

    $scope.$watch('project.userProperties', (newValue: UserProperties) => {
      if (newValue !== undefined) {
        // noinspection LoopStatementThatDoesntLoopJS
        for (const key of Object.keys(newValue.userProfilePickLists)) {
          $scope.currentListId = key;
          break;
        }

        $scope.currentListsEnabled = {};
        for (const userProfilePropertyEnabled of $scope.project.userProperties.userProfilePropertiesEnabled) {
          $scope.currentListsEnabled[userProfilePropertyEnabled] = true;
        }
      }

      startWatchingPickLists();
    });

  }])
  .controller('ProjectSettingsUsersCtrl', ['$scope', 'userService', 'projectService',
    'silNoticeService', 'messageService',
  ($scope, userService, projectService, notice, messageService) => {

    $scope.userFilter = '';
    $scope.message = {};
    $scope.addMembersCollapsed = true;
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

    $scope.toggleAddMembers = function toggleAddMembers(): void {
      $scope.addMembersCollapsed = !$scope.addMembersCollapsed;
      $scope.newMessageCollapsed = true;
    };

    $scope.toggleMessageUsers = function toggleMessageUsers(): void {
      $scope.newMessageCollapsed = !$scope.newMessageCollapsed;
      $scope.addMembersCollapsed = true;
    };

    $scope.show.messaging = function showMessaging() {
      return !!($scope.settings.email.fromAddress);
    };

    $scope.sendMessageToSelectedUsers = function sendMessageToSelectedUsers(): void {
      if ($scope.selected.length === 0) {
        $scope.messagingWarning = 'Select at least one member to message';
        return;
      }

      const userIds = [];
      for (const user of $scope.selected) {
        userIds.push(user.id);
      }

      messageService.send(userIds, $scope.message.subject, $scope.message.emailTemplate,
        $scope.message.smsTemplate).then((result: JsonRpcResult<any>) => {
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
    $scope.updateSelection = function updateSelection(event: Event, user: User): void {
      const selectedIndex = $scope.selected.indexOf(user);
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.checked) {
        $scope.messagingWarning = '';
      }

      if (checkbox.checked && selectedIndex === -1) {
        $scope.selected.push(user);
      } else if (!checkbox.checked && selectedIndex !== -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function isSelected(user: User): boolean {
      // noinspection EqualityComparisonWithCoercionJS
      return user != null && $scope.selected.includes(user);
    };

    $scope.removeProjectUsers = function removeProjectUsers(): void {
      const userIds: string[] = [];
      if ($scope.selected.length === 0) {
        // TODO ERROR
        return;
      }

      for (const user of $scope.selected) {
        // Guard against project owner being removed
        if (user.id !== $scope.project.ownerRef.id) {
          userIds.push(user.id);
        } else {
          notice.push(notice.WARN, 'Project owner cannot be removed');
        }
      }

      projectService.removeUsers(userIds).then((result: JsonRpcResult<any>) => {
        if (result.ok) {
          $scope.queryProjectSettings();
          $scope.selected = [];
          if (userIds.length === 1) {
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
          { key: 'project_manager', name: 'Manager' },
          { key: 'tech_support', name: 'Tech Support'}
      ];

    $scope.onRoleChange = function onRoleChange(user: User): void {
      projectService.updateUserRole(user.id, user.role).then((result: JsonRpcResult<any>) => {
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

    $scope.queryUser = function queryUser(userName: string): void {
      userService.typeaheadExclusive(userName, $scope.project.id).then((result: JsonRpcResult<any>) => {
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

    $scope.addModeText = function addModeText(addMode: string): string {
      return $scope.addModes[addMode].en;
    };

    $scope.addModeIcon = function addModeIcon(addMode: string): string {
      return $scope.addModes[addMode].icon;
    };

    $scope.updateAddMode = function updateAddMode(newMode: string): void {
      if (newMode in $scope.addModes) {
        $scope.addMode = newMode;
      } else {
        // This also covers the case where newMode is undefined
        $scope.calculateAddMode();
      }
    };

    $scope.isExcludedUser = function isExcludedUser(userName: string): boolean {
      // Is this userName in the "excluded users" list? (I.e., users already in current project)
      // Note that it's not enough to check whether the "excluded users" list is non-empty,
      // as the "excluded users" list might include some users that had a partial match on
      // the given username. E.g. when creating a new user Bob Jones with username "bjones",
      // after typing "bjo" the "excluded users" list will include Bob Johnson (bjohnson).
      if (!$scope.excludedUsers) {
        return false;
      }

      for (const excludedUser of $scope.excludedUsers) {
        if (userName === excludedUser.username || userName === excludedUser.name || userName === excludedUser.email) {
          return excludedUser;
        }
      }

      return false;
    };

    $scope.calculateAddMode = function calculateAddMode(): void {
      // TODO This isn't adequate. Need to watch the 'typeahead.userName' and 'selection' also.
      // CP 2013-07
      if (!$scope.typeahead.userName) {
        $scope.addMode = 'addNew';
        $scope.disableAddButton = true;
        $scope.warningText = '';
      } else if ($scope.isExcludedUser($scope.typeahead.userName)) {
        const excludedUser = $scope.isExcludedUser($scope.typeahead.userName);
        $scope.addMode = 'addExisting';
        $scope.disableAddButton = true;
        $scope.warningText = excludedUser.name + ' (username \'' + excludedUser.username +
          '\', email ' + excludedUser.email + ') is already a member.';
      } else if ($scope.typeahead.userName.indexOf('@') !== -1) {
        $scope.addMode = 'invite';
        $scope.disableAddButton = false;
        $scope.warningText = '';
      } else if ($scope.users.length === 0) {
        $scope.addMode = 'addNew';
        $scope.disableAddButton = false;
        $scope.warningText = '';
      } else {
        $scope.addMode = 'addExisting';
        $scope.disableAddButton = false;
        $scope.warningText = '';
      }
    };

    $scope.addProjectUser = function addProjectUser(): void {
      if ($scope.addMode === 'addNew') {
        userService.createSimple($scope.typeahead.userName).then((result: JsonRpcResult<any>) => {
          if (result.ok) {
            notice.push(notice.INFO, 'User created.  Username: ' + $scope.typeahead.userName +
              '    Password: ' + result.data.password);
            $scope.queryProjectSettings();
          }
        });
      } else if ($scope.addMode === 'addExisting') {
        const existingUser = {
          id: $scope.user.id
        } as User;

        // Check existing users to see if we're adding someone that already exists in the project
        projectService.listUsers().then((result: JsonRpcResult<any>) => {
          if (result.ok) {
            for (const user of result.data.users) {
              // This approach works, but is unnecessarily slow. We should have an "is user in  project?" API, rather
              // than returning all users then searching through them in O(N) time.
              // TODO: Make an "is user in project?" query API. 2014-06 RM
              if (user.id === existingUser.id) {
                notice.push(notice.WARN, '\'' + $scope.user.name + '\' is already a member of ' +
                  $scope.project.projectName + '.');
                return;
              }
            }

            projectService.updateUserRole($scope.user.id, 'contributor').then((updateUserRoleResult: JsonRpcResult<any>) => {
              if (updateUserRoleResult.ok) {
                notice.push(notice.SUCCESS, '\'' + $scope.user.name + '\' was added to ' +
                  $scope.project.projectName + ' successfully');
                $scope.queryProjectSettings();
              }
            });
          }
        });
      } else if ($scope.addMode === 'invite') {
        userService.sendInvite($scope.typeahead.userName).then((result: JsonRpcResult<any>) => {
          if (result.ok) {
            notice.push(notice.SUCCESS, '\'' + $scope.typeahead.userName + '\' was invited to join the project ' +
              $scope.project.projectName);
            $scope.queryProjectSettings();
          }
        });
      }
    };

    $scope.selectUser = function selectUser(user: User): void {
      if (user) {
        $scope.user = user;
        $scope.typeahead.userName = user.name;
        $scope.updateAddMode('addExisting');
      }
    };

    $scope.imageSource = function imageSource(avatarRef: string): string {
      return avatarRef ? '/Site/views/shared/image/avatar/' + avatarRef :
        '/Site/views/shared/image/avatar/anonymous02.png';
    };

  }])
  .name;
