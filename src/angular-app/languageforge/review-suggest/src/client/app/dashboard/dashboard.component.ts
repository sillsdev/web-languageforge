import { Component, OnInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { ProjectService } from '../shared/services/project.service';

@Component({
  moduleId: module.id,
  selector: 'dashboard',
  templateUrl: 'dashboard.component.html'
})

export class DashboardComponent {

  private projects: any[];

  constructor(private projectService: ProjectService, 
              private router: Router) { }

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects(): void {
    this.projectService.getProjectList().subscribe(projects => {
      this.projects = projects.entries;
    });
  }

  onSelect(project: any) {
    this.projectService.setProjectId(project.id);
    this.router.navigate(['/review', project.id]);
  }
}
