import { Component, OnInit } from '@angular/core';
import { Record } from '@orbit/data';
import { Observable } from 'rxjs';

import { SFProjectService } from '../core/sfproject.service';
import { SFProject } from '../shared/models/sfproject';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent implements OnInit {
  private readonly updatedNames: Map<string, string> = new Map<string, string>();

  public projects$: Observable<SFProject[]>;

  constructor(private readonly projectService: SFProjectService) { }

  get isDirty(): boolean {
    return this.updatedNames.size > 0;
  }

  ngOnInit(): void {
    this.projects$ = this.projectService.getAll();
  }

  updateProjectName(project: Record, value: string): void {
    if (project.attributes.projectName === value) {
      return;
    }
    project.attributes.projectName = value;
    this.updatedNames.set(project.id, value);
  }

  async update(): Promise<void> {
    for (const [projectId, projectName] of this.updatedNames) {
      await this.projectService.updateById(projectId, { projectName });
    }
    this.updatedNames.clear();
  }
}
