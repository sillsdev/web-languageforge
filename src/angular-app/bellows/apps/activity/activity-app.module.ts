import * as angular from 'angular';

import { ActivityAppComponent } from './activity-app.component';

export const ActivityAppModule = angular
  .module('activity', [
    'ngRoute',
    'bellows.services',
    'ui.bootstrap',
    'sgw.ui.breadcrumb'
  ])
  .component('activityApp', ActivityAppComponent)
  .name;
