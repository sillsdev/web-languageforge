import { Component, OnInit } from '@angular/core';
import { Record } from '@orbit/data';

import { SFProjectService } from '../core/sfproject.service';
import { SFProjectResource } from '../shared/resources/sfproject-resource';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent implements OnInit {
  private readonly updatedNames: Map<string, string> = new Map<string, string>();

  public projects: SFProjectResource[];

  constructor(private readonly projectService: SFProjectService) { }

  get isDirty(): boolean {
    return this.updatedNames.size > 0;
  }

  async ngOnInit(): Promise<void> {
    this.projects = await this.projectService.getAll();
    console.log(this.projects);
  }

  updateProjectName(project: Record, value: string): void {
    if (project.attributes.projectName === value) {
      return;
    }
    project.attributes.projectName = value;
    this.updatedNames.set(project.id, value);
  }

  update(): void {
    for (const update of this.updatedNames) {
      this.projectService.updateById(update[0], { projectName: update[1] });
    }
    this.updatedNames.clear();
  }
}
