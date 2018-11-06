import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent implements OnInit {
  private readonly updatedProjects: Set<SFProject> = new Set<SFProject>();

  public projects$: Observable<SFProject[]>;

  constructor(private readonly projectService: SFProjectService) { }

  get isDirty(): boolean {
    return this.updatedProjects.size > 0;
  }

  ngOnInit(): void {
    this.projects$ = this.projectService.getAll();
  }

  updateProjectName(project: SFProject, value: string): void {
    if (project.projectName === value) {
      return;
    }
    project.projectName = value;
    this.updatedProjects.add(project);
  }

  async update(): Promise<void> {
    for (const project of this.updatedProjects) {
      await this.projectService.update(project);
    }
    this.updatedProjects.clear();
  }
}
