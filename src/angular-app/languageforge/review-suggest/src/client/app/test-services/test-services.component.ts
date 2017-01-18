import { Component } from '@angular/core';

import { LfApiService } from '../shared/services/lf-api.service';
import { ProjectService } from '../shared/services/project.service';

@Component({
  moduleId: module.id,
  selector: 'test-services',
  templateUrl: 'test-services.component.html'
})

export class TestServicesComponent {
  private result: any;
  private projects: any[];

  constructor(private lfApiService: LfApiService, private ProjectService: ProjectService) {
    this.lfApiService.getUserProfile().subscribe (response => {
      this.result = response.data;
      console.log(this.result);
      this.getProjects();
    });
  }

  getProjects() {
    this.ProjectService.getProjectList().subscribe(response =>{
      this.projects = response.entries;
      console.log(this.projects);
    });
  }
}
