import * as angular from 'angular';

import {ApplicationHeaderService} from '../../core/application-header.service';
import {BreadcrumbService} from '../../core/breadcrumbs/breadcrumb.service';
import {SiteWideNoticeService} from '../../core/site-wide-notice-service';

export class SiteAdminAppController implements angular.IController {

  static $inject = ['breadcrumbService',
                    'siteWideNoticeService',
                    'applicationHeaderService'];
  constructor(private breadcrumbService: BreadcrumbService,
              private siteWideNoticeService: SiteWideNoticeService,
              private applicationHeaderService: ApplicationHeaderService) { }

  $onInit() {
    this.breadcrumbService.set('top', [
      { label: 'Site Administration' }
    ]);
    this.applicationHeaderService.setPageName('Site Administration');
    this.siteWideNoticeService.displayNotices();
  }

}
export const SiteAdminComponent: angular.IComponentOptions = {
  controller: SiteAdminAppController,
  templateUrl: '/angular-app/bellows/apps/siteadmin/site-admin.component.html'
};
