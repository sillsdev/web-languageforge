import * as angular from 'angular';

import { CoreModule } from '../../core/core.module';
import { NoticeModule } from '../../core/notice/notice.module';
import { PuiUtilityModule } from '../../shared/pui-utils.module';
import { SiteAdminArchivedProjectsComponent } from './site-admin-archived-projects.component';
import { SiteAdminUsersComponent } from './site-admin-users.component';

export const SiteAdminAppModule = angular
  .module('siteadmin', ['ngRoute', 'ui.bootstrap', CoreModule,
    'palaso.ui.listview', 'palaso.ui.typeahead', NoticeModule, PuiUtilityModule
  ])
  .component('siteAdminUsers', SiteAdminUsersComponent)
  .component('siteAdminArchivedProjects', SiteAdminArchivedProjectsComponent)
  .name;
