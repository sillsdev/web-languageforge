import * as angular from 'angular';

import { NoticeService } from './notice.service';
import { Session, SessionService } from '../session.service';

export class NoticeController {
  gitHubRepo: string;

  static $inject: string[] = ['silNoticeService', 'sessionService'];
  constructor(private noticeService: NoticeService, private sessionService: SessionService) {
    sessionService.getSession().then((session: Session) => {
      this.gitHubRepo = 'web-' + session.baseSite();
    });
  }

  closeNotice(id: string) {
    this.noticeService.removeById(id);
  };

  notices() {
    return this.noticeService.get();
  };

  getLoadingMessage() {
    return this.noticeService.getLoadingMessage()
  };

  isLoading() {
    return this.noticeService.isLoading()
  };

  showProgressBar() {
    return this.noticeService.showProgressBar()
  };

  getPercentComplete() {
    return this.noticeService.getPercentComplete()
  };
}

export const noticeComponent: angular.IComponentOptions = {
  templateUrl: '/angular-app/bellows/core/notice/notice.component.html',
  controller: NoticeController
};
