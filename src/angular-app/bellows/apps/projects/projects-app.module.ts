import * as angular from 'angular';

import { ProjectsAppComponent } from './projects-app.component';

export const ProjectsAppModule = angular
  .module('projects', ['ui.bootstrap', 'bellows.services',
    'palaso.ui.listview', 'palaso.ui.notice', 'palaso.ui.utils'
  ])
  .component('projectsApp', ProjectsAppComponent)
  .name;
