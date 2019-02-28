import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

import { GetAllParameters } from '../json-api.service';
import { Project } from '../models/project';
import { ProjectUser } from '../models/project-user';
import { User } from '../models/user';
import { SubscriptionDisposable } from '../subscription-disposable';
import { UserService } from '../user.service';
import { nameof } from '../utils';
import { SaDeleteDialogComponent } from './sa-delete-dialog.component';

interface Row {
  readonly user: User;
  readonly projects: Project[];
}

@Component({
  selector: 'app-sa-users',
  templateUrl: './sa-users.component.html',
  styleUrls: ['./sa-users.component.scss']
})
export class SaUsersComponent extends SubscriptionDisposable implements OnInit {
  @HostBinding('class') classes = 'flex-column';

  length: number = 0;
  pageIndex: number = 0;
  pageSize: number = 50;
  showAddPanel: boolean = false;
  showEditPanel: boolean = false;

  userRows: Row[];

  private userId: string;
  private dialogRef: MatDialogRef<SaDeleteDialogComponent, string>;

  private readonly searchTerm$: BehaviorSubject<string>;
  private readonly parameters$: BehaviorSubject<GetAllParameters<User>>;
  private readonly reload$: BehaviorSubject<void>;

  constructor(private readonly dialog: MatDialog, private readonly userService: UserService) {
    super();
    this.searchTerm$ = new BehaviorSubject<string>('');
    this.parameters$ = new BehaviorSubject<GetAllParameters<User>>(this.getParameters());
    this.reload$ = new BehaviorSubject<void>(null);
  }

  ngOnInit() {
    const include = [[nameof<User>('projects'), nameof<ProjectUser>('project')]];
    this.subscribe(
      this.userService.onlineSearch(this.searchTerm$, this.parameters$, this.reload$, include),
      searchResults => {
        if (searchResults && searchResults.data) {
          this.userRows = searchResults.data.map(user => {
            const projects = searchResults
              .getManyIncluded<ProjectUser>(user.projects)
              .map(pu => searchResults.getIncluded<Project>(pu.project));
            return { user, projects };
          });
          this.length = searchResults.totalPagedCount;
        }
      }
    );
  }

  get isLoading(): boolean {
    return this.userRows == null;
  }

  updateSearchTerm(term: string): void {
    this.searchTerm$.next(term);
  }

  updatePage(pageIndex: number, pageSize: number): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.parameters$.next(this.getParameters());
  }

  addUser(): void {
    this.showEditPanel = false;
    this.showAddPanel = !this.showAddPanel;
    this.userId = '';
  }

  editUser(userId: string): void {
    if (this.showAddPanel || this.userId !== userId) {
      this.showEditPanel = true;
      this.showAddPanel = false;
    } else {
      this.showEditPanel = !this.showEditPanel;
    }
    this.userId = userId;
  }

  removeUser(userId: string): void {
    this.dialogRef = this.dialog.open(SaDeleteDialogComponent, {
      width: '350px',
      height: '200px',
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation.toLowerCase() === 'confirmed') {
        this.showEditPanel = false;
        this.deleteUser(userId);
      }
    });
  }

  outputUserList(): void {
    this.showEditPanel = false;
    this.showAddPanel = false;
    this.reload$.next(null);
  }

  private async deleteUser(userId: string) {
    await this.userService.onlineDelete(userId);
    this.reload$.next(null);
  }

  private getParameters(): GetAllParameters<User> {
    return {
      sort: [{ name: 'active', order: 'descending' }, { name: 'name', order: 'ascending' }],
      pagination: { index: this.pageIndex, size: this.pageSize }
    };
  }
}
