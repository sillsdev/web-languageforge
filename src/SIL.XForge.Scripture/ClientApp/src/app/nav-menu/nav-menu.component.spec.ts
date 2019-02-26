import { MdcList } from '@angular-mdc/web';
import { Location } from '@angular/common';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from 'xforge-common/auth.service';
import { MapQueryResults } from 'xforge-common/json-api.service';
import { User, UserRef } from 'xforge-common/models/user';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject, SFProjectRef } from '../core/models/sfproject';
import { SFProjectUser } from '../core/models/sfproject-user';
import { Text } from '../core/models/text';
import { SFProjectService } from '../core/sfproject.service';
import { NavMenuComponent } from './nav-menu.component';

describe('NavMenuComponent', () => {
  it('navigate to last project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project01');
    expect(env.menuLength).toEqual(4);
    verify(env.mockedUserService.updateCurrentUserAttributes(anything())).never();
  }));

  it('navigate to different project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project02']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project02');
    expect(env.menuLength).toEqual(3);
    verify(
      env.mockedUserService.updateCurrentUserAttributes(deepEqual({ site: { currentProjectId: 'project02' } }))
    ).once();
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
    verify(
      env.mockedUserService.updateCurrentUserAttributes(deepEqual({ site: { currentProjectId: 'project02' } }))
    ).once();
  }));

  it('connect project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.navigate(['/projects', 'project01']);
    env.init();

    expect(env.isDrawerVisible).toBeTruthy();
    expect(env.selectedProjectId).toEqual('project01');
    env.selectProject('');
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
});

@Component({
  template: `
    <div fxLayout="row">
      <app-nav-menu></app-nav-menu>
      <div fxLayout="column"><router-outlet></router-outlet></div>
    </div>
  `
})
class AppComponent {}

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
  { path: 'my-account', component: MockComponent },
  { path: 'connect-project', component: MockComponent }
];

class TestEnvironment {
  readonly fixture: ComponentFixture<AppComponent>;
  readonly router: Router;
  readonly location: Location;

  readonly mockedAuthService = mock(AuthService);
  readonly mockedUserService = mock(UserService);
  readonly mockedSFProjectService = mock(SFProjectService);

  constructor() {
    when(this.mockedUserService.currentUserId).thenReturn('user01');
    when(this.mockedAuthService.isLoggedIn).thenResolve(true);
    when(this.mockedUserService.getCurrentUser()).thenReturn(
      of(
        new User({
          id: 'user01',
          site: { currentProjectId: 'project01' }
        })
      )
    );
    when(this.mockedUserService.getProjects('user01', deepEqual([[nameof<SFProjectUser>('project')]]))).thenReturn(
      of(
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
              translateConfig: { enabled: true },
              checkingConfig: { enabled: true }
            }),
            new SFProject({
              id: 'project02',
              translateConfig: { enabled: false },
              checkingConfig: { enabled: true }
            })
          ]
        )
      )
    );

    when(this.mockedSFProjectService.getTexts('project01')).thenReturn(
      of([
        new Text({
          id: 'text01',
          name: 'Book 1'
        }),
        new Text({
          id: 'text02',
          name: 'Book 2'
        })
      ])
    );

    when(this.mockedSFProjectService.getTexts('project02')).thenReturn(
      of([
        new Text({
          id: 'text03',
          name: 'Book 3'
        }),
        new Text({
          id: 'text04',
          name: 'Book 4'
        })
      ])
    );

    TestBed.configureTestingModule({
      declarations: [AppComponent, MockComponent, NavMenuComponent],
      imports: [UICommonModule, RouterTestingModule.withRoutes(ROUTES)],
      providers: [
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) }
      ]
    });
    this.router = TestBed.get(Router);
    this.location = TestBed.get(Location);
    this.fixture = TestBed.createComponent(AppComponent);
    this.fixture.ngZone.run(() => this.router.initialNavigation());
  }

  get component(): NavMenuComponent {
    const navMenuElem = this.fixture.debugElement.query(By.directive(NavMenuComponent));
    return navMenuElem.componentInstance;
  }

  get menuDrawer(): DebugElement {
    return this.fixture.debugElement.query(By.css('#menu-drawer'));
  }

  get menuList(): MdcList {
    const listElem = this.fixture.debugElement.query(By.css('#menu-list'));
    return listElem.componentInstance;
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

  init(): void {
    this.component.openDrawer();
    this.wait();
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
    flush();
    this.fixture.detectChanges();
    flush();
  }
}
