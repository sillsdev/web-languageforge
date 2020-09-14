import { Component, OnInit } from '@angular/core';
import { Project, Membership } from '../models/project.model';
import { ProjectsService } from '../services/projects.service';
import { RolesService } from '../services/roles.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { tap } from 'rxjs/operators';
import { of, Observable, forkJoin } from 'rxjs';
import { UsersService } from '../services/users.service';

// TODO: Edit project name and/or description
// TODO: Consider dumping the "pending edits" system, as it doesn't add enough value for the UI complexity
// TODO: Consider editing project code, though the backend will need to support repo renaming before that's a good idea

@Component({
  selector: 'app-single-project',
  templateUrl: './single-project.component.html',
  styleUrls: ['./single-project.component.scss']
})
export class SingleProjectComponent implements OnInit {
  project: Project;
  showAddPersonBox = false;
  usersFound: User[];
  userToAdd: User;
  roles: Role[];
  selectedRole: string;
  editMode = false;
  edits: any[] = [];

  constructor(private route: ActivatedRoute,
              private readonly projects: ProjectsService,
              private readonly users: UsersService,
              private readonly rolesService: RolesService)
  {
    this.rolesService.roles.subscribe(roles => this.roles = roles);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => this.getProject(params.get('id')));
    // this.project = fakeProject;
  }

  getProject(code: string): void {
    this.projects.getProject(code).subscribe(project => this.project = project);
  }

  enterEditMode(): void {
    this.editMode = true;
  }

  resetEdits(): void {
    this.editMode = false;
    this.edits = [];
  }

  saveEdits(): void {
    const editResults = (this.edits ?? []).map(edit => this.applyEdit(edit));
    forkJoin(editResults).subscribe(() => {
      this.resetEdits();
      this.resetUserSearch();
      this.getProject(this.project.code);
    });
  }

  isPendingDelete(username: string): boolean {
    return (this.edits ?? []).findIndex(edit => edit.action === 'removeUser' && edit.username === username) >= 0;
  }

  arrayReplace<T>(arr: T[], index: number, newItem: T): T[] {
    // Like arr.splice(index, 1, newItem), but returns new array rather than modifying in-place
    return arr.map((item, idx) => idx === index ? newItem : item);
  }

  arrayRemoveIdx<T>(arr: T[], index: number): T[] {
    // Like arr.splice(index, 1), but returns new array rather than modifying in-place
    return arr.filter((item, idx) => idx !== index);
  }

  arrayPush<T>(arr: T[], newItem: T): T[] {
    // Like arr.push(newItem), but returns new array rather than modifying in-place
    return [...arr, newItem];
  }

  editRoleForMember(username: string, oldRole: string, newRole: string): void {
    this.edits = this.edits ?? [];
    const oldRemove = this.edits.findIndex(edit => edit.action === 'removeUser' && edit.username === username);
    if (oldRemove >= 0) {
      // Editing a user will cancel any pending removal
      this.edits = this.arrayRemoveIdx(this.edits, oldRemove);
    }
    const oldEdit = this.edits.findIndex(edit => edit.action === 'editRole' && edit.username === username);
    if (oldEdit < 0) {
      this.edits = this.arrayPush(this.edits, {action: 'editRole', username, oldRole, newRole});
    } else if (oldRole === newRole) {
      this.edits = this.arrayRemoveIdx(this.edits, oldEdit);  // Remove old edit and don't add new one
    } else {
      this.edits = this.arrayReplace(this.edits, oldEdit, {action: 'editRole', username, oldRole, newRole});
    }
  }

  toggleAddPerson(): void {
    this.showAddPersonBox = !this.showAddPersonBox;
  }

  searchUsers(searchText: string): Observable<User[]> {
    return this.users.searchUsers(searchText);
  }

  foundUsers(users: User[]): void {
    this.usersFound = users;
  }

  selectUser(user: User): void {
    this.userToAdd = user;
  }

  selectRole(role: string): void {
    this.selectedRole = role;
  }

  addMember(user: User, role: string): void {
    this.edits = this.edits ?? [];
    if (user?.username && role) {
      const oldRemove = this.edits.findIndex(edit => edit.action === 'removeUser' && edit.username === user.username);
      if (oldRemove >= 0) {
        // Adding a pending-removal member cancels the removal
        this.edits = this.arrayRemoveIdx(this.edits, oldRemove);
      }
      const oldAdd = this.edits.findIndex(edit => edit.action === 'addMember' && edit.username === user.username);
      if (oldAdd < 0) {
        this.edits = this.arrayPush(this.edits, {action: 'addMember', username: user.username, role});
      } else if (this.edits[oldAdd].role !== role) {
        this.edits = this.arrayReplace(this.edits, oldAdd, {action: 'addMember', username: user.username, role});
      }
      this.resetUserSearch();
    }
  }

  resetUserSearch(): void {
    this.userToAdd = undefined;
    this.selectedRole = undefined;
    this.usersFound = undefined;
    this.showAddPersonBox = false;
  }

  removeMember(member: Membership): void {
    // TODO: Consider a confirmation dialog when removing the last manager of a project
    if (member?.username) {
      this.edits = this.edits ?? [];
      const oldAdd = this.edits.findIndex(edit => edit.action === 'addMember' && edit.username === member.username);
      if (oldAdd >= 0) {
        // Removing a member cancels all pending adds
        this.edits = this.arrayRemoveIdx(this.edits, oldAdd);
      }
      const oldEdit = this.edits.findIndex(edit => edit.action === 'editRole' && edit.username === member.username);
      if (oldEdit >= 0) {
        // Removing a member cancels all pending editss
        this.edits = this.arrayRemoveIdx(this.edits, oldEdit);
      }
      const oldRemove = this.edits.findIndex(edit => edit.action === 'removeUser' && edit.username === member.username);
      if (oldRemove < 0) {
        this.edits = this.arrayPush(this.edits, {action: 'removeUser', username: member.username});
      }
    }
  }

  describeEdit(edit: any): string {
    switch (edit.action) {
      case 'removeUser':
        return `Will remove ${edit.username}`;
      case 'addMember':
        return `Will add ${edit.username} with role ${edit.role}`;
      case 'editRole':
        return `Will change ${edit.username} from ${edit.oldRole} to ${edit.newRole}`;
      default:
        return `Unknown edit type ${edit.action}: ${edit}`;
    }
  }

  applyEdit(edit: any): Observable<any> {
    switch (edit.action) {
      case 'removeUser':
        return this.applyRemoveMember(edit.username);
      case 'addMember':
        return this.applyAddMember(edit.username, edit.role);
      case 'editRole':
        return this.applyEditRoleForMember(edit.username, edit.oldRole, edit.newRole);
      default:
        return of(null);
    }
  }

  applyRemoveMember(member: Membership): Observable<any> {
    if (this?.project?.code && member?.username) {
      console.log('Will remove', member.username, 'from project', this.project.code);
      return this.projects.removeUser(this.project.code, member.username).pipe(
        tap(res => console.log('Removing member', member, 'returned result', res))
      );
    } else {
      return of(null);
    }
  }

  applyAddMember(username: string, role: string): Observable<any> {
    if (this?.project?.code && username && role) {
      console.log('Will add', username, 'with role', role);
      return this.projects.addUserWithRole(this.project.code, username, role).pipe(
      tap(() => {
        console.log('Successfully added', username, 'to', this.project.code, 'with role', role);
      }));
    } else {
      return of(null);
    }
  }

  applyEditRoleForMember(username: string, oldRole: string, newRole: string): Observable<any> {
    if (this?.project?.code && username && newRole) {
      console.log('Will change', username, 'from', oldRole ?? '(no previous role)', 'to', newRole);
      return this.projects.addUserWithRole(this.project.code, username, newRole).pipe(
      tap(() => {
        console.log('Successfully changed role of', username, 'in', this.project.code, 'to', newRole);
      }));
    } else {
      return of(null);
    }
  }

}
