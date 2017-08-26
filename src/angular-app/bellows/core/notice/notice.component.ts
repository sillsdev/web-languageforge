import * as angular from 'angular';

import { Notice, NoticeService } from './notice.service';
import { Session, SessionService } from '../session.service';

export class NoticeController implements angular.IController {
  gitHubRepo: string;

  static $inject: string[] = ['silNoticeService', 'sessionService'];
  constructor(private noticeService: NoticeService, private sessionService: SessionService) {
    sessionService.getSession().then((session: Session) => {
      this.gitHubRepo = 'web-' + session.baseSite();
    });
  }

  closeNotice(id: string): void {
    this.noticeService.removeById(id);
  };

  notices(): Notice[] {
    return this.noticeService.get();
  };

  getLoadingMessage(): string {
    return this.noticeService.getLoadingMessage()
  };

  isLoading(): boolean {
    return this.noticeService.isLoading()
  };

  showProgressBar(): boolean {
    return this.noticeService.showProgressBar()
  };

  getPercentComplete(): number {
    return this.noticeService.getPercentComplete()
  };
}

export const noticeComponent: angular.IComponentOptions = {
  templateUrl: '/angular-app/bellows/core/notice/notice.component.html',
  controller: NoticeController
};
