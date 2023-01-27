import * as angular from 'angular';

import { ProjectService } from '../../core/api/project.service';
import { SessionService } from '../../core/session.service';

export class SiteAdminProjectInsightsController implements angular.IController {
  static $inject = ['projectService', 'sessionService'];
  constructor(private projectService: ProjectService, private sessionService: SessionService) { }

  async downloadInsights() {
    const site = (await this.sessionService.getSession()).baseSite();
    const dto = await this.projectService.csvInsights();

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(dto.data);
    link.download = `languageforge_project_insights_${new Date().toISOString()}.csv`;
    // Gecko doesn't download when using link.click()
    link.dispatchEvent(new MouseEvent('click'));
  }
}

export const SiteAdminProjectInsightsComponent: angular.IComponentOptions = {
  controller: SiteAdminProjectInsightsController,
  template: `<a href data-ng-click="$ctrl.downloadInsights()">Download project insights as CSV file</a>`
};
