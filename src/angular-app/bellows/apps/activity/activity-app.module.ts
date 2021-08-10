import * as angular from 'angular';
import {BreadcrumbModule} from '../../core/breadcrumbs/breadcrumb.module';
import {SiteWideNoticeModule} from '../../core/site-wide-notice-service';
import {CoreModule} from '../../core/core.module';
import {ActivityAppComponent} from './activity-app.component';
import {ActivityContainerComponent} from './activity-container.component';

export const ActivityAppModule = angular
  .module('activity', [
    'ngRoute',
    'ui.bootstrap',
    CoreModule,
    BreadcrumbModule,
    SiteWideNoticeModule
  ])
  .component('activityApp', ActivityAppComponent)
  .component('activityContainer', ActivityContainerComponent)
  .name;
