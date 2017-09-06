import * as angular from 'angular';

import { UserService } from '../../core/api/user.service';
import { NoticeService } from '../../core/notice/notice.service';
import { SessionService } from '../../core/session.service';

export class ChangePasswordController implements angular.IController {
  password: string;
  confirm_password: string;

  static $inject = ['userService', 'sessionService', 'silNoticeService'];
  constructor(private userService: UserService, private sessionService: SessionService,
              private notice: NoticeService) {}

  updatePassword() {
    if (this.password === this.confirm_password) {
      this.sessionService.getSession().then((session) => {
        const user = session.userId();
        const password = this.password;
        this.userService.changePassword(user, password).then(() => {
          this.notice.push(this.notice.SUCCESS, 'Password updated successfully');
          this.password = this.confirm_password = '';
        });
      });
    }
  };
}

export const ChangePasswordComponent: angular.IComponentOptions = {
  controller: ChangePasswordController,
  templateUrl: '/angular-app/bellows/apps/changepassword/change-password.component.html'
};
