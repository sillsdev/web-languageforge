import * as angular from 'angular';

import {UserService} from '../../../bellows/core/api/user.service';
import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../bellows/core/session.service';

export const SfChecksInviteFriendModule = angular
  .module('sf.ui.invitefriend', [
    CoreModule,
    NoticeModule
  ])
  .controller('inviteAFriend', ['$rootScope', '$scope', 'userService', 'sessionService', 'silNoticeService',
  ($rootScope, $scope, userService: UserService, sessionService: SessionService, notice: NoticeService) => {

    $scope.showInviteForm = false;
    $scope.showInviteDiv = true;

    sessionService.getSession().then(session => {
      $scope.canCreateUsers = function canCreateUsers(): boolean {
        return session.hasProjectRight(sessionService.domain.USERS, sessionService.operation.CREATE);
      };

      $scope.checkVisibility = function checkVisibility(): void {
        $scope.showInviteDiv = session.getProjectSetting('allowInviteAFriend') ||
          $scope.canCreateUsers();
      };

      $rootScope.$on('$viewContentLoaded', $scope.checkVisibility);
      $scope.checkVisibility();
    });

    $scope.sendInvite = function sendInvite() {
      userService.sendInvite($scope.email).then(result => {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'An invitation email has been sent to ' + $scope.email);
          $scope.showInviteForm = false;
          $scope.email = '';
        }
      });
    };
  }])
  .name;
