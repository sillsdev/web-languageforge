import * as angular from 'angular';

import {BreadcrumbModule} from '../../core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../core/core.module';
import {NoticeModule} from '../../core/notice/notice.module';
import {ListViewModule} from '../../shared/list-view.component';
import {TypeAheadModule} from '../../shared/type-ahead.module';
import {PuiUtilityModule} from '../../shared/utils/pui-utils.module';
import {SiteAdminArchivedProjectsComponent} from './site-admin-archived-projects.component';
import {SiteAdminUsersComponent} from './site-admin-users.component';
import {SiteAdminComponent} from './site-admin.component';

export const SiteAdminAppModule = angular
  .module('siteadmin', [
    'ngRoute',
    'ui.bootstrap',
    CoreModule,
    ListViewModule,
    TypeAheadModule,
    NoticeModule,
    PuiUtilityModule,
    BreadcrumbModule
  ])
  .component('siteAdminApp', SiteAdminComponent)
  .component('siteAdminUsers', SiteAdminUsersComponent)
  .component('siteAdminArchivedProjects', SiteAdminArchivedProjectsComponent)
  .name;
