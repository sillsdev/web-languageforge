import { Component, HostBinding, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GetAllParameters } from '../json-api.service';
import { Project } from '../models/project';
import { NONE_ROLE, ProjectRole } from '../models/project-role';
import { ProjectUser } from '../models/project-user';
import { ProjectUserService } from '../project-user.service';
import { ProjectService } from '../project.service';
import { SubscriptionDisposable } from '../subscription-disposable';
import { UserService } from '../user.service';

class Row {
  isUpdatingRole: boolean = false;

  constructor(public readonly project: Project, public projectUser: ProjectUser, public projectRole: ProjectRole) {}

  get isMember(): boolean {
    return this.projectUser != null;
  }

  get name(): string {
    return this.project.projectName;
  }

  get tasks(): string {
    return this.project.taskNames.join(', ');
  }
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent extends SubscriptionDisposable implements OnInit {
  @HostBinding('class') classes = 'flex-column';

  rows: Row[];

  length: number = 0;
  pageIndex: number = 0;
  pageSize: number = 50;

  private projects: Project[];
  private projectUsers: Map<string, ProjectUser>;

  private readonly searchTerm$: BehaviorSubject<string>;
  private readonly parameters$: BehaviorSubject<GetAllParameters<Project>>;

  constructor(
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
    private readonly projectUserService: ProjectUserService
  ) {
    super();
    this.searchTerm$ = new BehaviorSubject<string>('');
    this.parameters$ = new BehaviorSubject<GetAllParameters<Project>>(this.getParameters());
  }

  get isLoading(): boolean {
    return this.projects == null || this.projectUsers == null;
  }

  get projectRoles(): ProjectRole[] {
    return Array.from(this.projectService.roles.values());
  }

  ngOnInit() {
    this.subscribe(this.projectService.onlineSearch(this.searchTerm$, this.parameters$), searchResults => {
      this.projects = searchResults.results;
      this.length = searchResults.totalPagedCount;
      this.generateRows();
    });
    this.subscribe(this.userService.onlineGetProjects(this.userService.currentUserId), projectUserResults => {
      this.projectUsers = new Map<string, ProjectUser>();
      for (const projectUser of projectUserResults.results) {
        this.projectUsers.set(projectUser.project.id, projectUser);
      }
      this.generateRows();
    });
  }

  updateSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  updatePage(pageIndex: number, pageSize: number): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.parameters$.next(this.getParameters());
  }

  async updateRole(row: Row, projectRole: ProjectRole): Promise<void> {
    row.isUpdatingRole = true;
    if (row.projectUser == null) {
      // add user to project
      const projectUser = await this.projectUserService.onlineCreate(
        row.project.id,
        this.userService.currentUserId,
        projectRole.role
      );
      this.projectUsers.set(projectUser.id, projectUser);
      row.projectUser = projectUser;
    } else if (projectRole === NONE_ROLE) {
      // remove user from project
      await this.projectUserService.onlineDelete(row.projectUser.id);
      this.projectUsers.delete(row.projectUser.id);
      row.projectUser = null;
    } else {
      // update role in project
      await this.projectUserService.onlineUpdateRole(row.projectUser.id, projectRole.role);
      row.projectUser.role = projectRole.role;
    }
    row.projectRole = projectRole;
    row.isUpdatingRole = false;
  }

  private generateRows(): void {
    if (this.isLoading) {
      return;
    }

    const rows: Row[] = [];
    for (const project of this.projects) {
      const projectUser = this.projectUsers.get(project.id);
      let projectRole = NONE_ROLE;
      if (projectUser != null) {
        projectRole = this.projectService.roles.get(projectUser.role);
      }
      rows.push(new Row(project, projectUser, projectRole));
    }
    this.rows = rows;
  }

  private getParameters(): GetAllParameters<Project> {
    return {
      sort: [{ name: 'projectName', order: 'ascending' }],
      pagination: { index: this.pageIndex, size: this.pageSize }
    };
  }
}
