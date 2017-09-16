import * as angular from 'angular';

import { SiteAdminUsersComponent } from './site-admin-users.component';
import { SiteAdminArchivedProjectsComponent } from './site-admin-archived-projects.component';

export const SiteAdminAppModule = angular
  .module('siteadmin', ['ngRoute', 'ui.bootstrap', 'bellows.services',
    'palaso.ui.listview', 'palaso.ui.typeahead', 'palaso.ui.notice', 'palaso.ui.utils'
  ])
  .component('siteAdminUsers', SiteAdminUsersComponent)
  .component('siteAdminArchivedProjects', SiteAdminArchivedProjectsComponent)
  .name;
