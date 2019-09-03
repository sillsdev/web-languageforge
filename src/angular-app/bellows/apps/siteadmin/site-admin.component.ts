import * as angular from 'angular';

import {ApplicationHeaderService} from '../../core/application-header.service';
import {BreadcrumbService} from '../../core/breadcrumbs/breadcrumb.service';
import {BrowserCheckService} from '../../core/browser-check.service';

export class SiteAdminAppController implements angular.IController {

  static $inject = ['breadcrumbService',
                    'browserCheckService',
                    'applicationHeaderService'];
  constructor(private breadcrumbService: BreadcrumbService,
              private browserCheckService: BrowserCheckService,
              private applicationHeaderService: ApplicationHeaderService) { }

  $onInit() {
    this.breadcrumbService.set('top', [
      { label: 'Site Administration' }
    ]);
    this.applicationHeaderService.setPageName('Site Administration');
    this.browserCheckService.warnIfIE();
  }

}
export const SiteAdminComponent: angular.IComponentOptions = {
  controller: SiteAdminAppController,
  templateUrl: '/angular-app/bellows/apps/siteadmin/site-admin.component.html'
};
