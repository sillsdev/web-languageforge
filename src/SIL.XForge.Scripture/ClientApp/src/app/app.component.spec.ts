import { MdcList, OverlayContainer } from '@angular-mdc/web';
import { Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { AuthService } from 'xforge-common/auth.service';
import { MapQueryResults, QueryResults } from 'xforge-common/json-api.service';
import { LocationService } from 'xforge-common/location.service';
import { User, UserRef } from 'xforge-common/models/user';
import { NoticeService } from 'xforge-common/notice.service';
import { RealtimeService } from 'xforge-common/realtime.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { AppComponent, CONNECT_PROJECT_OPTION } from './app.component';
import { SFProject, SFProjectRef } from './core/models/sfproject';
import { SFProjectUser } from './core/models/sfproject-user';
import { Text, TextRef } from './core/models/text';
import { SFProjectService } from './core/sfproject.service';
import { ProjectDeletedDialogComponent } from './project-deleted-dialog/project-deleted-dialog.component';
import { SFAdminAuthGuard } from './shared/sfadmin-auth.guard';

describe('AppComponent', () => {
  it('navigate to last project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project01');
    expect(env.menuLength).toEqual(4);
    verify(env.mockedUserService.updateCurrentProjectId(anything())).never();
  }));

  it('navigate to different project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project02']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project02');
    expect(env.menuLength).toEqual(3);
    verify(env.mockedUserService.updateCurrentProjectId('project02')).once();
  }));

  it('expand/collapse task', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project01');
    env.selectItem(0);
    expect(env.menuLength).toEqual(7);
    env.selectItem(0);
    expect(env.menuLength).toEqual(4);
  }));

  it('change project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project01');
    env.selectProject('project02');
    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project02');
    expect(env.location.path()).toEqual('/projects/project02');
    verify(env.mockedUserService.updateCurrentProjectId('project02')).once();
  }));

  it('connect project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project01');
    env.selectProject(CONNECT_PROJECT_OPTION);
    expect(env.isDrawerVisible).toBeFalsy();
    expect(env.location.path()).toEqual('/connect-project');
  }));

  it('close menu when navigating to a non-project route', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/my-account']);
    env.init();

    expect(env.isDrawerVisible).toBeFalsy();
    expect(env.component.selectedProject).toBeUndefined();
  }));

  it('reponse to remote project deletion', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project01');
    env.deleteProject(false);
    expect(env.projectDeletedDialog).toBeDefined();
    verify(env.mockedUserService.updateCurrentProjectId()).once();
    env.confirmDialog();
    expect(env.isDrawerVisible).toBeFalsy();
    expect(env.location.path()).toEqual('/projects');
    verify(env.mockedSFProjectService.localDelete('project01')).once();
  }));

  it('reponse to remote project deletion when no project selected', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedSFProjectService.onlineExists('project01')).thenResolve(false);
    env.deleteProject(false);
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeFalsy();
    verify(env.mockedUserService.updateCurrentProjectId()).once();
    expect(env.location.path()).toEqual('/projects');
  }));

  it('response to local project deletion', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project01');
    env.deleteProject(true);
    expect(env.isDrawerVisible).toBeFalsy();
    expect(env.location.path()).toEqual('/projects');
  }));

  it('should only display Sync and Settings for admin', fakeAsync(() => {
    const env = new TestEnvironment();
    env.makeUserAProjectAdmin(false);
    expect(env.syncItem).toBeNull();
    expect(env.settingsItem).toBeNull();
    env.makeUserAProjectAdmin();
    expect(env.syncItem).toBeDefined();
    expect(env.settingsItem).toBeDefined();
  }));

  it('partial data does not throw', fakeAsync(() => {
    // SF-229 The project properties may only be partiually available
    // the first time we hear back from the observable. Don't prevent
    // it from trying again by crashing in the fixture or component code.
    const env = new TestEnvironment();
    env.setProjects(
      new MapQueryResults(
        [
          new SFProjectUser({
            id: 'projectuser01',
            project: new SFProjectRef('project01'),
            user: new UserRef('user01')
          })
        ],
        undefined,
        [
          new SFProject({
            id: 'project01'
          })
        ]
      )
    );
    env.navigate(['/projects', 'project01']);

    expect(() => env.init()).not.toThrow();
  }));
});

@Component({
  template: `
    <div>Mock</div>
  `
})
class MockComponent {}

const ROUTES: Route[] = [
  { path: 'projects/:projectId/settings', component: MockComponent },
  { path: 'projects/:projectId', component: MockComponent },
  { path: 'projects/:projectId/translate/:textId', component: MockComponent },
  { path: 'projects/:projectId/translate', component: MockComponent },
  { path: 'projects/:projectId/checking/:textId', component: MockComponent },
  { path: 'projects/:projectId/checking', component: MockComponent },
  { path: 'projects', component: MockComponent },
  { path: 'my-account', component: MockComponent },
  { path: 'connect-project', component: MockComponent }
];

@NgModule({
  imports: [UICommonModule],
  declarations: [ProjectDeletedDialogComponent],
  entryComponents: [ProjectDeletedDialogComponent],
  exports: [ProjectDeletedDialogComponent]
})
class DialogTestModule {}

class TestEnvironment {
  readonly component: AppComponent;
  readonly fixture: ComponentFixture<AppComponent>;
  readonly router: Router;
  readonly location: Location;
  readonly overlayContainer: OverlayContainer;

  readonly mockedAuthService = mock(AuthService);
  readonly mockedUserService = mock(UserService);
  readonly mockedSFAdminAuthGuard = mock(SFAdminAuthGuard);
  readonly mockedSFProjectService = mock(SFProjectService);
  readonly mockedRealtimeService = mock(RealtimeService);
  readonly mockedLocationService = mock(LocationService);
  readonly mockedNoticeService = mock(NoticeService);

  private readonly currentUser: User;
  private readonly projects$: BehaviorSubject<QueryResults<SFProjectUser[]>>;

  constructor() {
    this.currentUser = new User({
      id: 'user01',
      site: { currentProjectId: 'project01' }
    });

    this.projects$ = new BehaviorSubject<QueryResults<SFProjectUser[]>>(
      new MapQueryResults(
        [
          new SFProjectUser({
            id: 'projectuser01',
            project: new SFProjectRef('project01'),
            user: new UserRef('user01')
          }),
          new SFProjectUser({
            id: 'projectuser02',
            project: new SFProjectRef('project02'),
            user: new UserRef('user01')
          })
        ],
        undefined,
        [
          new SFProject({
            id: 'project01',
            projectName: 'project01',
            translateConfig: { enabled: true },
            checkingConfig: { enabled: true },
            texts: [new TextRef('text01'), new TextRef('text02')]
          }),
          new SFProject({
            id: 'project02',
            projectName: 'project02',
            translateConfig: { enabled: false },
            checkingConfig: { enabled: true },
            texts: [new TextRef('text03'), new TextRef('text04')]
          }),
          new Text({
            id: 'text01',
            name: 'Book 1'
          }),
          new Text({
            id: 'text02',
            name: 'Book 2'
          }),
          new Text({
            id: 'text03',
            name: 'Book 3'
          }),
          new Text({
            id: 'text04',
            name: 'Book 4'
          })
        ]
      )
    );

    when(this.mockedUserService.currentUserId).thenReturn('user01');
    when(this.mockedAuthService.isLoggedIn).thenResolve(true);
    when(this.mockedUserService.getCurrentUser()).thenReturn(of(this.currentUser));
    when(
      this.mockedUserService.getProjects(
        'user01',
        deepEqual([[nameof<SFProjectUser>('project'), nameof<SFProject>('texts')]])
      )
    ).thenReturn(this.projects$);
    when(this.mockedUserService.updateCurrentProjectId(anything())).thenResolve();
    when(this.mockedSFAdminAuthGuard.allowTransition(anything())).thenReturn(of(true));

    TestBed.configureTestingModule({
      declarations: [AppComponent, MockComponent],
      imports: [UICommonModule, DialogTestModule, RouterTestingModule.withRoutes(ROUTES)],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: SFAdminAuthGuard, useFactory: () => instance(this.mockedSFAdminAuthGuard) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: RealtimeService, useFactory: () => instance(this.mockedRealtimeService) },
        { provide: LocationService, useFactory: () => instance(this.mockedLocationService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) }
      ]
    });
    this.router = TestBed.get(Router);
    this.location = TestBed.get(Location);
    this.fixture = TestBed.createComponent(AppComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
    this.fixture.ngZone.run(() => this.router.initialNavigation());
  }

  get menuDrawer(): DebugElement {
    return this.fixture.debugElement.query(By.css('#menu-drawer'));
  }

  get menuList(): MdcList {
    const listElem = this.fixture.debugElement.query(By.css('#menu-list'));
    return listElem.componentInstance;
  }

  get syncItem(): DebugElement {
    return this.fixture.debugElement.query(By.css('#sync-item'));
  }

  get settingsItem(): DebugElement {
    return this.fixture.debugElement.query(By.css('#settings-item'));
  }

  get selectedProjectId(): string {
    return this.component.projectSelect.value;
  }

  get menuLength(): number {
    return this.menuList.items.length;
  }

  get isDrawerVisible(): boolean {
    return this.menuDrawer != null;
  }

  get projectDeletedDialog(): HTMLElement {
    const oce = this.overlayContainer.getContainerElement();
    return oce.querySelector('mdc-dialog');
  }

  get okButton(): HTMLElement {
    const oce = this.overlayContainer.getContainerElement();
    return oce.querySelector('#ok-button');
  }

  init(): void {
    this.component.openDrawer();
    this.wait();
  }

  makeUserAProjectAdmin(isProjectAdmin: boolean = true) {
    this.component.isProjectAdmin$ = of(isProjectAdmin);
  }

  navigate(commands: any[]): void {
    this.fixture.ngZone.run(() => this.router.navigate(commands)).then();
  }

  selectItem(index: number): void {
    const elem = this.menuList.getListItemByIndex(index).getListItemElement();
    elem.click();
    this.wait();
  }

  selectProject(projectId: string): void {
    this.component.projectSelect.setSelectionByValue(projectId);
    this.wait();
  }

  wait(): void {
    this.fixture.detectChanges();
    flush(30);
    this.fixture.detectChanges();
    flush(30);
  }

  deleteProject(isLocal: boolean): void {
    if (isLocal) {
      this.currentUser.site.currentProjectId = null;
    }
    this.projects$.next(new MapQueryResults<SFProjectUser[]>([]));
    this.wait();
  }

  confirmDialog(): void {
    this.okButton.click();
    this.wait();
  }

  setProjects(results: MapQueryResults<SFProjectUser[]>): void {
    this.projects$.next(results);
  }
}
