import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { ProjectService } from '../shared/services/project.service';

import { MaterializeDirective, MaterializeAction } from 'angular2-materialize';
declare var Materialize: any;

@Component({
  moduleId: module.id,
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html'
})

export class DashboardComponent {

  private projects: any[];

  constructor(private projectService: ProjectService, 
              private router: Router) { }

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.projectService.getProjectList().subscribe(response => {
      if (response.success) {
        this.projects = response.data.entries;
      } else {
        let toastContentFailed = '<b>Failed to get project list! ' + response.message + '</b>';
        Materialize.toast(toastContentFailed, 1000, 'red');
      }
    }, error => {
      this.handleError(error);
    });
  }

  onSelect(project: any) {
    this.projectService.setProjectId(project.id);
    this.router.navigate(['/review', project.id]);
  }

  handleError(error: any) {
    let toastContentFailed = '<b>Error! ' + error.statusText + '</b>';
    Materialize.toast(toastContentFailed, 1000, 'red');
  }
}
