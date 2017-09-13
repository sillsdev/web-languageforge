import * as angular from 'angular';

import { NoticeServiceModule } from '../../core/notice/notice.module';
import { ProjectsAppComponent } from './projects-app.component';
import { PuiUtilityModule } from '../../shared/pui-utils.module';

export const ProjectsAppModule = angular
  .module('projects', ['ui.bootstrap', 'bellows.services',
    'palaso.ui.listview', NoticeServiceModule, PuiUtilityModule
  ])
  .component('projectsApp', ProjectsAppComponent)
  .name;
