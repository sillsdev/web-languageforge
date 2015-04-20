'use strict';

angular.module('usermanagement.members', ['bellows.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'palaso.ui.notice', 'ngRoute'])

  .controller('MembersCtrl', ['$scope', 'userService', 'projectService', 'sessionService', 'silNoticeService', '$window',
    function($scope, userService, projectService, ss, notice, $window) {
      $scope.list = {
        visibleUsers: [],
        users: []
      };
      $scope.roles = {};
      $scope.userFilter = '';

      $scope.queryUserList = function queryUserList() {
        projectService.listUsers(function(result) {
          if (result.ok) {
            $scope.list.users = result.data.users;
            $scope.list.userCount = result.data.userCount;
            $scope.project = result.data.project;
            $scope.roles = $scope.project.roles;
          }
        });
      };

      $scope.rights = {};
      $scope.rights.remove = ss.hasProjectRight(ss.domain.USERS, ss.operation.DELETE);
      $scope.rights.add = ss.hasProjectRight(ss.domain.USERS, ss.operation.CREATE);
      $scope.rights.changeRole = ss.hasProjectRight(ss.domain.USERS, ss.operation.EDIT);
      $scope.rights.showControlBar = $scope.rights.add || $scope.rights.remove || $scope.rights.changeRole;

      /* ----------------------------------------------------------
       * List
       * ---------------------------------------------------------- */
      $scope.selected = [];
      $scope.updateSelection = function updateSelection(event, item) {
        var selectedIndex = $scope.selected.indexOf(item);
        var checkbox = event.target;
        if (checkbox.checked && selectedIndex == -1) {
          $scope.selected.push(item);
        } else if (!checkbox.checked && selectedIndex != -1) {
          $scope.selected.splice(selectedIndex, 1);
        }
      };
      $scope.isSelected = function isSelected(item) {
        return item != null && $scope.selected.indexOf(item) >= 0;
      };

      $scope.removeProjectUsers = function removeProjectUsers() {
        var userIds = [];
        for (var i = 0, l = $scope.selected.length; i < l; i++) {

          // Guard against project owner being removed
          if ($scope.selected[i].id != $scope.project.ownerRef.id) {
            userIds.push($scope.selected[i].id);
          } else {
            notice.push(notice.WARN, "Project owner cannot be removed");
          }
        }
        if (l == 0) {

          // TODO ERROR
          return;
        }
        projectService.removeUsers(userIds, function(result) {
          if (result.ok) {
            if (userIds.indexOf(ss.currentUserId()) != -1) {
              // redirect if you just removed yourself from the project
              notice.push(notice.SUCCESS, "You have been removed from this project");
              $window.location.href = '/app/projects';
            } else {
              $scope.queryUserList();
              $scope.selected = [];
              if (userIds.length == 1) {
                notice.push(notice.SUCCESS, "The user was removed from this project");
              } else {
                notice.push(notice.SUCCESS, userIds.length + " users were removed from this project");
              }
            }
          }
        });
      };

      $scope.onRoleChange = function onRoleChange(user) {
        projectService.updateUserRole(user.id, user.role, function(result) {
          if (result.ok) {
            notice.push(notice.SUCCESS, user.username + "'s role was changed to " + user.role);
          }
        });
      };

      /* ----------------------------------------------------------
       * Typeahead
       * ---------------------------------------------------------- */
      $scope.users = [];
      $scope.addModes = {
        'addNew': { 'en': 'Create New User', 'icon': 'icon-user'},
        'addExisting' : { 'en': 'Add Existing User', 'icon': 'icon-user'},
        'invite': { 'en': 'Send Email Invite', 'icon': 'icon-envelope'}
      };
      $scope.addMode = 'addNew';
      $scope.disableAddButton = true;
      $scope.typeahead = {};
      $scope.typeahead.userName = '';

      $scope.queryUser = function queryUser(userName) {
        userService.typeaheadExclusive(userName, $scope.project.id, function(result) {
          
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
      $scope.addModeText = function addModeText(addMode) {
        return $scope.addModes[addMode].en;
      };
      $scope.addModeIcon = function addModeIcon(addMode) {
        return $scope.addModes[addMode].icon;
      };
      $scope.updateAddMode = function updateAddMode(newMode) {
        if (newMode in $scope.addModes) {
          $scope.addMode = newMode;
        } else {
          
          // This also covers the case where newMode is undefined
          $scope.calculateAddMode();
        }
      };

      /* Is this userName in the "excluded users" list? (I.e., users already in current project)
       * Note that it's not enough to check whether the "excluded users" list is non-empty,
       * as the "excluded users" list might include some users that had a partial match on
       * the given username. E.g. when creating a new user Bob Jones with username "bjones",
       * after typing "bjo" the "excluded users" list will include Bob Johnson (bjohnson). */
      $scope.isExcludedUser = function isExcludedUser(userName) {
        if (!$scope.excludedUsers) { return false; }
        for (var i=0, l=$scope.excludedUsers.length; i<l; i++) {
          if (userName == $scope.excludedUsers[i].username ||
            userName == $scope.excludedUsers[i].name     ||
            userName == $scope.excludedUsers[i].email) {
            return $scope.excludedUsers[i];
          }
        }
        return false;
      };

      $scope.calculateAddMode = function calculateAddMode() {
        
        // TODO This isn't adequate.  Need to watch the 'typeahead.userName' and 'selection' also. CP 2013-07
        if (!$scope.typeahead.userName) {
          $scope.addMode = 'addNew';
          $scope.disableAddButton = true;
          $scope.warningText = '';
        } else if ($scope.isExcludedUser($scope.typeahead.userName)) {
          var excludedUser = $scope.isExcludedUser($scope.typeahead.userName);
          $scope.addMode = 'addExisting';
          $scope.disableAddButton = true;
          $scope.warningText = excludedUser.name +
            " (username '" + excludedUser.username +
            "', email " + excludedUser.email +
            ") is already a member.";
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

      $scope.addProjectUser = function addProjectUser() {
        if ($scope.addMode == 'addNew') {
          userService.createSimple($scope.typeahead.userName, function(result) {
            if (result.ok) {
              notice.push(notice.INFO, "User created.  Username: " + $scope.typeahead.userName + "    Password: " + result.data.password);
              $scope.queryUserList();
            };
          });
        } else if ($scope.addMode == 'addExisting') {
          var model = {};
          model.id = $scope.user.id;
          
          // Check existing users to see if we're adding someone that already exists in the project
          projectService.users(function(result) {
            if (result.ok) {
              for (var i=0, l=result.data.users.length; i<l; i++) {
                
                /* This approach works, but is unnecessarily slow. We should have an "is user in project?" API,
                 * rather than returning all users then searching through them in O(N) time.
                 * TODO: Make an "is user in project?" query API. 2014-06 RM */
                var thisUser = result.data.users[i];
                if (thisUser.id == model.id) {
                  notice.push(notice.WARN, "'" + $scope.user.name + "' is already a member of " + $scope.project.projectName + ".");
                  return;
                }
              }
              projectService.updateUserRole($scope.user.id, 'contributor', function(result) {
                if (result.ok) {
                  notice.push(notice.SUCCESS, "'" + $scope.user.name + "' was added to " + $scope.project.projectName + " successfully");
                  $scope.queryUserList();
                }
              });
            }
          });
        } else if ($scope.addMode == 'invite') {
          userService.sendInvite($scope.typeahead.userName, function(result) {
            if (result.ok) {
              notice.push(notice.SUCCESS, "'" + $scope.typeahead.userName + "' was invited to join the project " + $scope.project.projectName);
              $scope.queryUserList();
            }
          });
        }
      };

      $scope.selectUser = function selectUser(item) {
        $scope.user = item;
        $scope.typeahead.userName = item.name;
        $scope.updateAddMode('addExisting');
      };

      $scope.imageSource = function imageSource(avatarRef) {
        return avatarRef ? '/images/shared/avatar/' + avatarRef : '/images/shared/avatar/anonymous02.png';
      };

    }
  ])
;
