import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Project } from '../models/project.model';
import { Router } from '@angular/router';
import { ProjectsService } from '../services/projects.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  dataSource = new MatTableDataSource<Project & {memberCount: number}>();
  columns = {
    code: 'Project Code',
    description: 'Description',
    name: 'Project Name',
    memberCount: 'Member Count',
  };

  constructor(private readonly router: Router, private readonly projects: ProjectsService) {
    this.projects.getProjects().pipe(
      map(result => result.map(proj => ({...proj, get memberCount(): number { return proj.membership.length; }}))),
    ).subscribe(result => this.dataSource.data = result);
  }

  itemSelected(proj: Project): void {
    this.router.navigateByUrl(`/admin/projects/${proj.code}`);
  }
}
