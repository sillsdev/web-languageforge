import { Component, OnInit, EventEmitter } from '@angular/core';

import { Project } from '../shared/models/project';
import { ProjectService } from '../shared/services/project.service';

import { MaterializeDirective, MaterializeAction } from 'angular2-materialize';

@Component({
  moduleId: module.id,
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html'
})

export class DashboardComponent {

  private projects: any[];

  public modalActions = new EventEmitter<string | MaterializeAction>();
  openModal() {
    this.modalActions.emit({ action: "modal", params: ['open'] });
  }

  closeModal() {
    this.modalActions.emit({ action: "modal", params: ['close'] });
  }


  constructor(public projectService: ProjectService) { }

  ngOnInit(): void {
    this.getProjects();

  }

  getProjects(): void {
    var rawProjects: any[];
    this.projectService.getProjectList().subscribe(projects => {
      this.projects = projects.entries;
      console.log(this.projects);
    });
  }
}
