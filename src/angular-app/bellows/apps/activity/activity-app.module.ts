import * as angular from 'angular';

import { CoreModule } from '../../core/core.module';
import { ActivityAppComponent } from './activity-app.component';
import { BreadcrumbModule } from '../../core/breadcrumbs/breadcrumb.module';

export const ActivityAppModule = angular
  .module('activity', [
    'ngRoute',
    'ui.bootstrap',
    CoreModule,
    BreadcrumbModule
  ])
  .component('activityApp', ActivityAppComponent)
  .name;
