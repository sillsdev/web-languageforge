import * as angular from 'angular';

import { NoticeModule } from './notice/notice.module';
import { NoticeService } from './notice/notice.service';

export class ErrorService {
  static $inject: string[] = ['$log', 'silNoticeService'];
  constructor(private $log: angular.ILogService, private noticeService: NoticeService) { }

  error(title: string, message: string = '') {
    this.$log.error('Error: ' + title + ' - ' + message);
    const errorTitle = '<b>Oh. ' + title + '</b>';
    this.noticeService.push(this.noticeService.ERROR, errorTitle, message);
  }

  notify(title: string, message: string, details: string = '') {
    this.$log.warn('Error: ' + title + ' - ' + message + ' (' + details + ')');
    const errorTitle = '<b>Oh. ' + title + '</b>';
    this.noticeService.push(this.noticeService.WARN, errorTitle, message);
  }
}

export const ErrorModule = angular
  .module('coreModule.errorService', [NoticeModule])
  .service('error', ErrorService)
  .name;
