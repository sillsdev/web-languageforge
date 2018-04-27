import * as angular from 'angular';

import {CoreModule} from '../../core/core.module';
import {NoticeModule} from '../../core/notice/notice.module';
import {PuiUtilityModule} from '../../shared/utils/pui-utils.module';
import {SiteAdminArchivedProjectsComponent} from './site-admin-archived-projects.component';
import {SiteAdminUsersComponent} from './site-admin-users.component';
import {SiteAdminComponent} from './site-admin.component';

export const SiteAdminAppModule = angular
  .module('siteadmin', ['ngRoute', 'ui.bootstrap', CoreModule,
    'palaso.ui.listview', 'palaso.ui.typeahead', NoticeModule, PuiUtilityModule, 'sgw.ui.breadcrumb'
  ])
  .component('siteAdminApp', SiteAdminComponent)
  .component('siteAdminUsers', SiteAdminUsersComponent)
  .component('siteAdminArchivedProjects', SiteAdminArchivedProjectsComponent)
  .name;
