import * as angular from 'angular';

import {BreadcrumbModule} from '../../core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../core/core.module';
import {NoticeModule} from '../../core/notice/notice.module';
import {SiteWideNoticeModule} from '../../core/site-wide-notice-service';
import {ListViewModule} from '../../shared/list-view.component';
import {TypeAheadModule} from '../../shared/type-ahead.module';
import {PuiUtilityModule} from '../../shared/utils/pui-utils.module';
import {LdapiProjectsComponent} from './ldapi-projects-view';
import {LdapiUsersComponent} from './ldapi-users-view';
import {SiteAdminArchivedProjectsComponent} from './site-admin-archived-projects.component';
import { SiteAdminProjectInsightsComponent } from './site-admin-project-insights.component';
import {SiteAdminUsersComponent} from './site-admin-users.component';
import {SiteAdminComponent} from './site-admin.component';
import {LdProjectMembersComponent} from '../../../languageforge/ldproject/ldproject-members.component';

export const SiteAdminAppModule = angular
  .module('siteadmin', [
    'ngRoute',
    'ngTable',
    'ui.bootstrap',
    CoreModule,
    ListViewModule,
    TypeAheadModule,
    NoticeModule,
    PuiUtilityModule,
    BreadcrumbModule,
    SiteWideNoticeModule
  ])
  .component('siteAdminApp', SiteAdminComponent)
  .component('siteAdminUsers', SiteAdminUsersComponent)
  .component('siteAdminLdprojects', LdapiProjectsComponent)
  .component('ldprojectmembers', LdProjectMembersComponent)
  .component('siteAdminLdusers', LdapiUsersComponent)
  .component('siteAdminProjectInsights', SiteAdminProjectInsightsComponent)
  .component('siteAdminArchivedProjects', SiteAdminArchivedProjectsComponent)
  .name;
