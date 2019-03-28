import { MdcDialog, MdcSelect } from '@angular-mdc/web';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { AuthService } from 'xforge-common/auth.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject } from '../core/models/sfproject';
import { SFProjectUser } from '../core/models/sfproject-user';
import { Text } from '../core/models/text';
import { SFAdminAuthGuard } from '../shared/sfadmin-auth.guard';
import { ProjectDeletedDialogComponent } from './project-deleted-dialog/project-deleted-dialog.component';

/** Project navigation menu, shown while working on a project. */
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent extends SubscriptionDisposable implements OnInit {
  isExpanded = false;
  drawerType = 'permanent';

  translateVisible: boolean = false;
  checkingVisible: boolean = false;

  selectedProject: SFProject;
  projects: SFProject[];
  texts: Text[];
  isProjectAdmin$: Observable<boolean>;

  private _projectSelect: MdcSelect;
  private projectDeletedDialogRef: any;

  constructor(
    private readonly authService: AuthService,
    media: ObservableMedia,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly adminAuthGuard: SFAdminAuthGuard,
    private readonly dialog: MdcDialog
  ) {
    super();
    this.subscribe(media.asObservable(), (change: MediaChange) => {
      if (['xs', 'sm'].includes(change.mqAlias)) {
        this.collapseDrawer();
        this.drawerType = 'dismissible';
      } else {
        this.drawerType = 'permanent';
      }
    });
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
          this._projectSelect.value = this.selectedProject.id;
        }
      });
    }
  }

  get isDrawerPermanent() {
    return this.drawerType === 'permanent';
  }

  async ngOnInit(): Promise<void> {
    if (!(await this.authService.isLoggedIn)) {
      return;
    }

    // retrieve the projectId from the current route. Since the nav menu is outside of the router outlet, it cannot use
    // ActivatedRoute to get the params. Instead the nav menu, listens to router events and traverses the route tree
    // to find the currently activated route
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
        const projectList: SFProject[] = results.data.map(pu => results.getIncluded(pu.project));
        // if the project deleted dialog is displayed, don't do anything
        if (this.projectDeletedDialogRef != null) {
          return;
        }
        const selectedProject = projectId == null ? undefined : projectList.find(p => p.id === projectId);

        // check if the currently selected project has been deleted
        if (selectedProject == null && this.selectedProject != null && projectId === this.selectedProject.id) {
          if (user.site != null && user.site.currentProjectId != null) {
            // the project was deleted remotely, so notify the user
            this.showProjectDeletedDialog();
          } else {
            // the project was deleted locally, so navigate to the start view
            this.router.navigateByUrl('/projects');
          }
        } else {
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

          // Delay setting projects array until have display names, to prevent it from being blank.
          this.projects = projectList;
          this.texts = results.getManyIncluded(this.selectedProject.texts);
          if (!this.selectedProject.translateConfig.enabled) {
            this.translateVisible = false;
          }
          if (!this.selectedProject.checkingConfig.enabled) {
            this.checkingVisible = false;
          }
          if (this._projectSelect != null) {
            this._projectSelect.value = this.selectedProject.id;
          }

          if (user.site == null || user.site.currentProjectId !== this.selectedProject.id) {
            this.userService.updateCurrentProjectId(this.selectedProject.id);
          }
        }
      }
    );
  }

  projectChanged(value: string): void {
    if (value === '') {
      this.router.navigateByUrl('/connect-project');
    } else if (this.selectedProject != null && value !== this.selectedProject.id) {
      this.router.navigate(['/projects', value]);
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

  private async showProjectDeletedDialog(): Promise<void> {
    await this.userService.updateCurrentProjectId();
    this.projectDeletedDialogRef = this.dialog.open(ProjectDeletedDialogComponent);
    this.projectDeletedDialogRef.afterClosed().subscribe(() => this.router.navigateByUrl('/projects'));
  }
}
