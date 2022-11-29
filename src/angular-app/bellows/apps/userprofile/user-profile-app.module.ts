import * as angular from 'angular';

import {BreadcrumbModule} from '../../core/breadcrumbs/breadcrumb.module';
import {SiteWideNoticeModule} from '../../core/site-wide-notice-service';
import {CoreModule} from '../../core/core.module';
import {NoticeModule} from '../../core/notice/notice.module';
import {UserProfileAppComponent} from './user-profile-app.component';

export const UserProfileAppModule = angular
  .module('userprofile', [
    'ui.bootstrap',
    BreadcrumbModule,
    SiteWideNoticeModule,
    CoreModule,
    NoticeModule
  ])
  .component('userProfileApp', UserProfileAppComponent)
  .name;
