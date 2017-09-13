import * as angular from 'angular';

import { NoticeServiceModule } from './notice/notice.module';
import { NoticeService } from './notice/notice.service';

export class ErrorService {
  static $inject: string[] = ['$log', 'silNoticeService'];
  constructor(private $log: angular.ILogService, private noticeService: NoticeService) { }

  error(title: string, message: string = '') {
    this.$log.error('Error: ' + title + ' - ' + message);
    let errorTitle = '<b>Oh. ' + title + '</b>';
    this.noticeService.push(this.noticeService.ERROR, errorTitle, message);
  };
}

export const ErrorServiceModule = angular
  .module('coreModule.errorService', ['palaso.ui.notice'])
  .service('error', ErrorService)
  .name;
