import * as angular from 'angular';

import {ProjectService} from '../../../bellows/core/api/project.service';
import {CoreModule} from '../../../bellows/core/core.module';

interface CurrentReport {
  output: string;
  currentId: string;
}

interface Report {
  id: string;
  name: string;
}

export class RunReportController implements angular.IController {
  report: CurrentReport = {
    output: '',
    currentId: null
  };
  reports: Report[] = [];

  static $inject: string[] = ['$scope', 'projectService'];
  constructor(private readonly $scope: angular.IScope, private readonly projectService: ProjectService) { }

  $onInit(): void {
    this.loadDto();
    this.$scope.$watch(() => this.report.currentId, () => {
      this.runReport();
    });
  }

  runReport(): void {
    if (this.report.currentId) {
      this.report.output = 'Running Report...';
      this.projectService.runReport(this.report.currentId, []).then(result => {
        if (result.ok) {
          this.report.output = result.data.output.replace(/\\n/g, '\n');
        }
      });
    } else {
      this.report.output = '';
    }
  }

  private loadDto(): void {
    this.projectService.getDto().then(result => {
      if (result.ok) {
        this.reports = result.data.reports;
      }
    });
  }

}

export const RunReportComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: RunReportController,
  templateUrl: '/angular-app/scriptureforge/sfchecks/project/run-report.component.html'
};

export const RunReportModule = angular
  .module('palaso.ui.runReport', [
    CoreModule
  ])
  .component('puiRunReport', RunReportComponent)
  .name;
