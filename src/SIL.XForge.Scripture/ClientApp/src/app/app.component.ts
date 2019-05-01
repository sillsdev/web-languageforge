import { MdcDialog, MdcSelect, MdcTopAppBar } from '@angular-mdc/web';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AuthService } from 'xforge-common/auth.service';
import { LocationService } from 'xforge-common/location.service';
import { User } from 'xforge-common/models/user';
import { NoticeService } from 'xforge-common/notice.service';
import { RealtimeService } from 'xforge-common/realtime.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject } from './core/models/sfproject';
import { SFProjectUser } from './core/models/sfproject-user';
import { Text } from './core/models/text';
import { SFProjectService } from './core/sfproject.service';
import { ProjectDeletedDialogComponent } from './project-deleted-dialog/project-deleted-dialog.component';
import { SFAdminAuthGuard } from './shared/sfadmin-auth.guard';

export const CONNECT_PROJECT_OPTION = '*connect-project*';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends SubscriptionDisposable implements OnInit {
  currentUser$: Observable<User>;

  isExpanded: boolean = false;

  translateVisible: boolean = false;
  checkingVisible: boolean = false;

  projects: SFProject[];
  texts: Text[];
  isProjectAdmin$: Observable<boolean>;

  private _projectSelect: MdcSelect;
  private projectDeletedDialogRef: any;
  private _topAppBar: MdcTopAppBar;
  private _selectedProject: SFProject;
  private _isDrawerPermanent: boolean = true;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly noticeService: NoticeService,
    media: ObservableMedia,
    private readonly projectService: SFProjectService,
    private readonly realtimeService: RealtimeService,
    private readonly route: ActivatedRoute,
    private readonly adminAuthGuard: SFAdminAuthGuard,
    private readonly dialog: MdcDialog
  ) {
    super();
    this.subscribe(media.asObservable(), (change: MediaChange) => {
      this.isDrawerPermanent = change.mqAlias !== 'xs' && change.mqAlias !== 'sm';
    });
  }

  @ViewChild('topAppBar')
  set topAppBar(value: MdcTopAppBar) {
    this._topAppBar = value;
    this.setTopAppBarVariant();
  }

  get projectSelect(): MdcSelect {
    return this._projectSelect;
  }

  @ViewChild(MdcSelect)
  set projectSelect(value: MdcSelect) {
    this._projectSelect = value;
    if (this._projectSelect != null) {
      setTimeout(() => {
        if (this.selectedProject != null) {
          this._projectSelect.reset();
          this._projectSelect.value = this.selectedProject.id;
        }
      });
    }
  }

  get selectedProject(): SFProject {
    return this._selectedProject;
  }

  set selectedProject(value: SFProject) {
    this._selectedProject = value;
    this.setTopAppBarVariant();
  }

  get isDrawerPermanent(): boolean {
    return this._isDrawerPermanent;
  }

  set isDrawerPermanent(value: boolean) {
    if (this._isDrawerPermanent !== value) {
      this._isDrawerPermanent = value;
      if (!this._isDrawerPermanent) {
        this.collapseDrawer();
      }
      this.setTopAppBarVariant();
    }
  }

  async ngOnInit(): Promise<void> {
    this.authService.init();
    if (await this.isLoggedIn) {
      this.currentUser$ = this.userService.getCurrentUser();

      // retrieve the projectId from the current route. Since the nav menu is outside of the router outlet, it cannot
      // use ActivatedRoute to get the params. Instead the nav menu, listens to router events and traverses the route
      // tree to find the currently activated route
      const projectId$ = this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        startWith(null),
        map(() => {
          let route = this.route.snapshot;
          while (route.firstChild != null) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(r => r.outlet === 'primary'),
        tap(r => {
          // ensure that the task of the current view has been expanded
          for (const segment of r.url) {
            if (segment.path === 'translate') {
              this.translateVisible = true;
              break;
            } else if (segment.path === 'checking') {
              this.checkingVisible = true;
              break;
            }
          }
        }),
        map(r => r.params['projectId'] as string),
        distinctUntilChanged(),
        tap(projectId => {
          this.isProjectAdmin$ = this.adminAuthGuard.allowTransition(projectId);
          // the project deleted dialog should be closed by now, so we can reset its ref to null
          if (projectId == null) {
            this.projectDeletedDialogRef = null;
          }
          this.realtimeService.reset();
        })
      );

      // populate the projects dropdown and select the current project
      this.subscribe(
        projectId$.pipe(
          switchMap(projectId =>
            this.userService
              .getProjects(this.userService.currentUserId, [
                [nameof<SFProjectUser>('project'), nameof<SFProject>('texts')]
              ])
              .pipe(map(r => ({ results: r, projectId })))
          ),
          withLatestFrom(this.userService.getCurrentUser())
        ),
        ([resultsAndProjectId, user]) => {
          const results = resultsAndProjectId.results;
          const projectId = resultsAndProjectId.projectId;
          this.projects = results.data.map(pu => results.getIncluded(pu.project));
          // if the project deleted dialog is displayed, don't do anything
          if (this.projectDeletedDialogRef != null) {
            return;
          }
          const selectedProject = projectId == null ? undefined : this.projects.find(p => p.id === projectId);

          // check if the currently selected project has been deleted
          if (selectedProject == null && projectId != null) {
            if (this.selectedProject != null && projectId === this.selectedProject.id) {
              if (user.site != null && user.site.currentProjectId != null) {
                // the project was deleted remotely, so notify the user
                this.showProjectDeletedDialog(user.site.currentProjectId);
              } else {
                // the project was deleted locally, so navigate to the start view
                this.navigateToStart();
              }
              return;
            } else {
              // the current project does not exist locally.
              // Check if the project exists online. If it doesn't, navigate to the start component.
              // If we don't check, we could be waiting forever.
              this.checkProjectExists(projectId);
            }
          }

          this.selectedProject = selectedProject;

          // Return early if 'Connect project' was clicked, or if we don't have all the
          // properties we need yet for the below or template.
          if (
            this.selectedProject == null ||
            this.selectedProject.texts == null ||
            this.selectedProject.translateConfig == null ||
            this.selectedProject.checkingConfig == null ||
            this.selectedProject.id == null ||
            this.selectedProject.projectName == null
          ) {
            return;
          }

          this.texts = results.getManyIncluded(this.selectedProject.texts);
          if (!this.selectedProject.translateConfig.enabled) {
            this.translateVisible = false;
          }
          if (!this.selectedProject.checkingConfig.enabled) {
            this.checkingVisible = false;
          }
          if (this._projectSelect != null) {
            this._projectSelect.reset();
            this._projectSelect.value = this.selectedProject.id;
          }

          if (user.site == null || user.site.currentProjectId !== this.selectedProject.id) {
            this.userService.updateCurrentProjectId(this.selectedProject.id);
          }
        }
      );
    }
  }

  get isLoggedIn(): Promise<boolean> {
    return this.authService.isLoggedIn;
  }

  get isLoading(): boolean {
    return this.noticeService.isLoading;
  }

  logOut(): void {
    this.authService.logOut();
  }

  async goHome(): Promise<void> {
    (await this.isLoggedIn) ? this.router.navigateByUrl('/projects') : this.locationService.go('/');
  }

  projectChanged(value: string): void {
    if (value === CONNECT_PROJECT_OPTION) {
      if (!this.isDrawerPermanent) {
        this.collapseDrawer();
      }
      this.router.navigateByUrl('/connect-project');
    } else if (value !== '' && this.selectedProject != null && value !== this.selectedProject.id) {
      this.router.navigate(['/projects', value]);
    }
  }

  itemSelected(): void {
    if (!this.isDrawerPermanent) {
      this.collapseDrawer();
    }
  }

  collapseDrawer() {
    this.isExpanded = false;
  }

  openDrawer() {
    this.isExpanded = true;
  }

  toggleDrawer() {
    this.isExpanded = !this.isExpanded;
  }

  drawerCollapsed(): void {
    this.isExpanded = false;
  }

  private async checkProjectExists(projectId: string): Promise<void> {
    if (!(await this.projectService.onlineExists(projectId))) {
      await this.userService.updateCurrentProjectId();
      this.navigateToStart();
    }
  }

  private async showProjectDeletedDialog(projectId: string): Promise<void> {
    await this.userService.updateCurrentProjectId();
    this.projectDeletedDialogRef = this.dialog.open(ProjectDeletedDialogComponent);
    this.projectDeletedDialogRef.afterClosed().subscribe(() => {
      this.projectService.localDelete(projectId);
      this.navigateToStart();
    });
  }

  private navigateToStart(): void {
    setTimeout(() => this.router.navigateByUrl('/projects'));
  }

  private setTopAppBarVariant(): void {
    if (this._topAppBar == null) {
      return;
    }

    const isShort = this._isDrawerPermanent && this._selectedProject != null;
    if (isShort !== this._topAppBar.short) {
      this._topAppBar.setShort(isShort, true);
    }
  }
}
