import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user.model';
import { UsersService } from '../services/users.service';
import { Observable, ReplaySubject, forkJoin } from 'rxjs';
import { map, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { ProjectsService } from '../services/projects.service';
import { Project } from '../models/project.model';
import { JsonApiService } from '../services/json-api.service';
import { NoticeService } from '../services/notice.service';
import { RolesService } from '../services/roles.service';
import { Role } from '../models/role.model';

@Component({
  selector: 'app-single-user',
  templateUrl: './single-user.component.html',
  styleUrls: ['./single-user.component.scss']
})
export class SingleUserComponent implements OnInit {
  user$ = new ReplaySubject<User>(1);
  user: User;
  foundProjects: [Project, boolean][];
  memberOf: [Project, string][];
  roles: Role[];
  selectedRole: string;
  editMode = false;
  changePasswordMode = false;
  addProjectsMode = false;

  constructor(private route: ActivatedRoute, private jsonApi: JsonApiService,
              private users: UsersService, private projectsService: ProjectsService,
              private readonly notice: NoticeService,
              private readonly rolesService: RolesService)
  {
    this.rolesService.roles.subscribe(roles => this.roles = roles);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(username => this.users.getUser(username)),
    ).subscribe(this.user$);
    // When user changes, get list of new user's projects
    this.user$.pipe(
      distinctUntilChanged()
    ).subscribe(newUser => {
      console.log('Looking up projects for', newUser.username);
      this.refreshProjectsList(newUser.username);
    });
    // Also keep a record of the current user in a non-observable for the template to use
    this.user$.subscribe(user => this.user = user);
  }

  resetUserEditForm(): void {
    ;
  }

  onEditUser(user: User): void {
    console.log('onEditUser', user);
    if (user) {
      this.user$.next(user);
      this.users.modifyUser(user).subscribe(() => this.notice.show('User data edited successfully'));
    }
    this.editMode = false;
  }

  refreshProjectsList(username: string): void {
    this.users.getProjectsForUser(username).subscribe(projects => this.memberOf = projects);
  }

  changePassword([oldPw, newPw]: [string, string]): void {
    this.changePasswordMode = false;
    const msg = oldPw == null
      ? `Password would be changed to ${newPw} (old password not required when logged in as an admin)`
      : `Password would be changed from ${oldPw} to ${newPw}`;
    // To show a brief notification that doesn't require interaction:
    // this.notice.show(msg);
    // To show a notification that requires clicking on the "Dismiss" button:
    this.notice.showMessageDialog(() => msg);
  }

  cancelChangePassword(): void {
    this.changePasswordMode = false;
  }

  searchProjects(searchText: string): Observable<Project[]> {
    return this.projectsService.searchProjects(searchText);
  }

  onFoundProjects(projects: Project[]): void {
    this.foundProjects = projects.map(proj => [proj, false]);
  }

  editUser(): void {
    const body = {
      login: { username: 'rhood', password: 'y' },
      // removeUser: 'rhood',
      // remove: [{username: 'rhood', role: 'Contributor'}],
      add: [{username: 'rhood', role: 'Contributor'}],
    };
    this.jsonApi.addRemoveUserExp<any>(body).subscribe();
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  createUser(): void {
    const body = {
      login: { username: 'x', password: 'y' },
      username: 'x',
      password: 'y',
      mustChangePassword: false,
      firstName: 'Joe',
      lastNames: 'Test',
      // language: (not provided, let's see what happens)
      emailAddresses: 'joe_test@example.com'
    };
    this.jsonApi.createUserExp<any>(body).subscribe();
  }

  addProjects(): void {
    this.addProjectsMode = true;
  }

  toggleProjectSelection(i: number): void {
    if (i >= 0 && this.foundProjects?.length > i) {
      this.foundProjects[i][1] = !this.foundProjects[i][1];
    }
  }

  addToProjects(): void {
    if (this.selectedRole && this.foundProjects && this.foundProjects.length > 0) {
      const projectCodes = this.foundProjects.filter(([proj, chosen]) => chosen).map((([proj, _]) => proj.code));
      forkJoin(projectCodes.map(code => this.projectsService.addUserWithRole(code, this.user.username, this.selectedRole)))
        .subscribe(() => {
          this.notice.show(`Successfully added ${this.user.username} to ${projectCodes.length} project(s).`);
          this.refreshProjectsList(this.user.username);
      });
    }
  }

  removeFromProject(projectCode): void {
    if (projectCode && this.user?.username) {
      this.projectsService.removeUser(projectCode, this.user.username)
      .subscribe(() => {
        this.notice.show(`Successfully removed ${this.user.username} from ${projectCode}.`);
        this.refreshProjectsList(this.user.username);
      });
    }
  }
}
