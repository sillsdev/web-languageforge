import * as angular from 'angular';

import {ApplicationHeaderService} from '../../core/application-header.service';
import {BreadcrumbService} from '../../core/breadcrumbs/breadcrumb.service';
import {BrowserCheckService} from '../../core/browser-check.service';

export class ActivityAppController implements angular.IController {
  static $inject = ['breadcrumbService',
    'browserCheckService',
    'applicationHeaderService'];
  constructor(private breadcrumbService: BreadcrumbService,
              private browserCheckService: BrowserCheckService,
              private applicationHeaderService: ApplicationHeaderService) { }

  $onInit(): void {
    this.breadcrumbService.set('top', [
      {label: 'Activity'}
    ]);
    this.applicationHeaderService.setPageName('Activity');
    this.browserCheckService.warnIfIE();
  }
}

export const ActivityAppComponent: angular.IComponentOptions = {
  controller: ActivityAppController,
  template: `
    <sil-notices></sil-notices>
    <activity-container></activity-container>
    `
};
