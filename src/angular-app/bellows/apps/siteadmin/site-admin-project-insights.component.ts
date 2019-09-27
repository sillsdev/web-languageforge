import * as angular from 'angular';

import { ProjectService } from '../../core/api/project.service';

export class SiteAdminProjectInsightsController implements angular.IController {
  static $inject = ['projectService'];
  constructor(private projectService: ProjectService) { }

  projects: any[];
  appName: 'sfchecks' | 'lexicon';

  async runInsights() {
    this.projectService.insights().then(insights => {
      this.appName = insights.data.appName;
      this.projects = (insights.data.projectList as any[]).sort((a, b) =>
        Date.parse(b.dateModified) - Date.parse(a.dateModified)
      );
    });
  }
}

export const SiteAdminProjectInsightsComponent: angular.IComponentOptions = {
  controller: SiteAdminProjectInsightsController,
  templateUrl: '/angular-app/bellows/apps/siteadmin/site-admin-project-insights.component.html'
};
