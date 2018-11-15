import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent implements OnInit {
  private readonly updatedProjects: Set<SFProject> = new Set<SFProject>();

  projects$: Observable<SFProject[]>;

  private readonly searchTerm$ = new Subject<string>();

  constructor(private readonly projectService: SFProjectService) { }

  get isDirty(): boolean {
    return this.updatedProjects.size > 0;
  }

  ngOnInit(): void {
    this.projects$ = this.projectService.search(this.searchTerm$,
      { sort: [{ name: 'projectName', order: 'ascending' }] }).pipe(map(r => r.results));
  }

  updateProjectName(project: SFProject, value: string): void {
    if (project.projectName === value) {
      return;
    }
    project.projectName = value;
    this.updatedProjects.add(project);
  }

  updateSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  async update(): Promise<void> {
    for (const project of this.updatedProjects) {
      await this.projectService.update(project);
    }
    this.updatedProjects.clear();
  }
}
