import * as angular from 'angular';

import { Session, SessionService } from '../session.service';
import { Notice, NoticeService } from './notice.service';

export class NoticeController implements angular.IController {
  issueEmail: string;

  static $inject: string[] = ['silNoticeService', 'sessionService'];
  constructor(private noticeService: NoticeService, private sessionService: SessionService) {
    this.issueEmail = 'issues@languageforge.org';
    sessionService.getSession().then((session: Session) => {
      this.issueEmail = 'issues@languageforge.org';
    });
  }

  $onInit() {
    this.noticeService.checkUrlForNotices();
  }

  closeNotice(id: string): void {
    this.noticeService.removeById(id);
  }

  notices(): Notice[] {
    return this.noticeService.get();
  }

  getLoadingMessage(): string {
    return this.noticeService.getLoadingMessage();
  }

  isLoading(): boolean {
    return this.noticeService.isLoading();
  }

  showProgressBar(): boolean {
    return this.noticeService.showProgressBar();
  }

  getPercentComplete(): number {
    return this.noticeService.getPercentComplete();
  }
}

export const NoticeComponent: angular.IComponentOptions = {
  templateUrl: '/angular-app/bellows/core/notice/notice.component.html',
  controller: NoticeController
};
