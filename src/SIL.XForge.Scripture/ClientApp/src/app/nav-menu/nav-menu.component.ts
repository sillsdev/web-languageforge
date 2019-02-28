import { MdcSelect } from '@angular-mdc/web';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';

import { AuthService } from 'xforge-common/auth.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject } from '../core/models/sfproject';
import { SFProjectUser } from '../core/models/sfproject-user';
import { Text } from '../core/models/text';
import { SFProjectService } from '../core/sfproject.service';

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

  private _projectSelect: MdcSelect;

  constructor(
    private readonly authService: AuthService,
    media: ObservableMedia,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly projectService: SFProjectService
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
      shareReplay(1)
    );

    this.subscribe(
      projectId$.pipe(
        switchMap(projectId =>
          this.userService
            .getProjects(this.userService.currentUserId, [[nameof<SFProjectUser>('project')]])
            .pipe(map(r => ({ projects: r.data.map(pu => r.getIncluded<SFProject>(pu.project)), projectId })))
        ),
        withLatestFrom(this.userService.getCurrentUser())
      ),
      ([projectData, user]) => {
        this.projects = projectData.projects;
        this.selectedProject =
          projectData.projectId == null ? undefined : projectData.projects.find(p => p.id === projectData.projectId);
        if (this.selectedProject != null) {
          if (!this.selectedProject.translateConfig.enabled) {
            this.translateVisible = false;
          }
          if (!this.selectedProject.checkingConfig.enabled) {
            this.checkingVisible = false;
          }
          if (this._projectSelect != null) {
            this._projectSelect.value = this.selectedProject.id;
          }

          if (user.site.currentProjectId !== this.selectedProject.id) {
            this.userService.updateCurrentUserAttributes({ site: { currentProjectId: this.selectedProject.id } });
          }
        }
      }
    );

    this.subscribe(
      projectId$.pipe(
        filter(projectId => projectId != null),
        switchMap(projectId => this.projectService.getTexts(projectId))
      ),
      texts => (this.texts = texts)
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
}
