import { Component, OnInit, EventEmitter } from '@angular/core';

//Fake Data
import { Project } from '../shared/models/project';
import { ProjectService } from '../shared/services/project.service';
//Fake Data

import { MaterializeDirective, MaterializeAction } from 'angular2-materialize';

@Component({
  moduleId: module.id,
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html'
})

export class DashboardComponent {

  projects = [
    new Project(0, "Greek"),
    new Project(1, "Latin"),
    new Project(2, "Thai"),
    new Project(3, "Russian"),
  ];


  public modalActions = new EventEmitter<string | MaterializeAction>();
  openModal() {
    this.modalActions.emit({ action: "modal", params: ['open'] });
  }

  closeModal() {
    this.modalActions.emit({ action: "modal", params: ['close'] });
  }


  /* EXPERIMENTING WITH THE services
    constructor(public projectService: ProjectService) { }
  
    ngOnInit(): void {
      this.getProject();
      
    }
  
    getProject() : void{
      this.projectService.getProjects().then(projects => {
        this.projects = projects;
  
      });
    }
  */
}
