import * as angular from 'angular';
import { NoticeService } from '../../../../bellows/core/notice/notice.service';

export class InviteMemberFormController implements angular.IController {
  inviteLink: string;
  static $inject = ['$scope', 'silNoticeService'];
  constructor(private $scope: angular.IScope) { }

  $onInit(): void {
    this.inviteLink = this.generateInviteLink();
  }

  generateInviteLink(): string {
    return 'http://languageforge.org/join/5XxyT47eWBdS';
  }

}

export const InviteMemberFormComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: InviteMemberFormController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/invite-member-form.component.html'
};
