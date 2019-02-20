import { OverlayContainer } from '@angular/cdk/overlay';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, getDebugNode, NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { GetAllParameters, MapQueryResults } from '../json-api.service';
import { Project, ProjectRef } from '../models/project';
import { ProjectUser, ProjectUserRef } from '../models/project-user';
import { Resource } from '../models/resource';
import { User, UserRef } from '../models/user';
import { UICommonModule } from '../ui-common.module';
import { UserService } from '../user.service';
import { SaDeleteDialogComponent } from './sa-delete-dialog.component';
import { SaUsersComponent } from './sa-users.component';

describe('SaUsersComponent', () => {
  it('should display spinner while loading', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupNullUserData();
    env.fixture.detectChanges();
    flush();

    expect(env.loadingSpinner).not.toBeNull();
    expect(env.noUsersLabel).toBeNull();
  }));

  it('should display message when there are no users', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupEmptyUserData();
    env.fixture.detectChanges();
    flush();

    expect(env.noUsersLabel).not.toBeNull();
    expect(env.loadingSpinner).toBeNull();
  }));

  it('should display users', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupUserData();
    env.fixture.detectChanges();
    flush();

    expect(env.loadingSpinner).toBeNull();
    expect(env.noUsersLabel).toBeNull();
    expect(env.userRows.length).toEqual(3);

    expect(env.cell(0, 1).query(By.css('strong')).nativeElement.innerText).toEqual('User 01');
    expect(env.cell(0, 2).query(By.css('a')).nativeElement.text).toEqual('Project 01');
    expect(env.removeUserButtonOnRow(0)).toBeTruthy();
    expect(env.cancelInviteButtonOnRow(0)).toBeFalsy();

    expect(env.cell(1, 1).query(By.css('strong')).nativeElement.innerText).toEqual('User 02');
    expect(env.cell(1, 2).query(By.css('a'))).toBeNull();
    expect(env.removeUserButtonOnRow(1)).toBeTruthy();
    expect(env.cancelInviteButtonOnRow(1)).toBeFalsy();

    expect(env.cell(2, 1).nativeElement.innerText).toContain('Awaiting response from');
    expect(env.cell(2, 1).nativeElement.innerText).toContain('user03@example.com');
    expect(env.cell(2, 2).query(By.css('a')).nativeElement.text).toEqual('Project 01');
    expect(env.removeUserButtonOnRow(2)).toBeFalsy();
    expect(env.cancelInviteButtonOnRow(2)).toBeTruthy();
  }));

  it('should delete users', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupUserData();
    env.fixture.detectChanges();
    flush();
    verify(env.mockedUserService.onlineDelete(anything())).never();

    env.clickElement(env.cancelInviteButtonOnRow(2));
    env.clickElement(env.deleteDialogYesButton);
    verify(env.mockedUserService.onlineDelete(anything())).once();

    env.clickElement(env.removeUserButtonOnRow(1));
    env.clickElement(env.deleteDialogYesButton);
    verify(env.mockedUserService.onlineDelete(anything())).twice();

    expect().nothing();
  }));

  it('should filter users', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupUserData();
    env.fixture.detectChanges();
    flush();

    expect(env.userRows.length).toEqual(3);
    env.setInputValue(env.filterInput, 'test');

    expect(env.userRows.length).toEqual(1);
  }));

  it('should page', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupUserData();
    env.component.pageSize = 2;
    env.fixture.detectChanges();
    flush();

    env.clickElement(env.nextPageButton);

    expect(env.userRows.length).toEqual(1);
  }));

  it('should display new user pane', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupEmptyUserData();
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeFalsy();

    env.clickElement(env.addUserButton);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeTruthy();

    env.clickElement(env.addUserButton);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeFalsy();
  }));

  it('should display account details pane', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupUserData();
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeFalsy();

    env.clickElement(env.userRows[0]);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeTruthy();

    env.clickElement(env.userRows[0]);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeFalsy();

    env.clickElement(env.userRows[0]);
    env.fixture.detectChanges();
    flush();
    env.clickElement(env.userRows[1]);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeTruthy();

    env.clickElement(env.userRows[1]);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeFalsy();
  }));

  it('should display account details or new user pane', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setupUserData();
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeFalsy();

    env.clickElement(env.userRows[0]);
    env.fixture.detectChanges();
    flush();
    env.clickElement(env.addUserButton);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeTruthy();

    env.clickElement(env.addUserButton);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeFalsy();

    env.clickElement(env.addUserButton);
    env.fixture.detectChanges();
    flush();
    env.clickElement(env.userRows[0]);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeTruthy();

    env.clickElement(env.userRows[0]);
    env.fixture.detectChanges();
    flush();
    expect(env.addEditPanel).toBeFalsy();
  }));
});

class TestProjectUser extends ProjectUser {
  static readonly TYPE = 'projectUser';

  constructor(init?: Partial<TestProjectUser>) {
    super(TestProjectUser.TYPE, init);
  }
}

class TestProjectUserRef extends ProjectUserRef {
  static readonly TYPE = TestProjectUser.TYPE;

  constructor(id?: string) {
    super(TestProjectUserRef.TYPE, id);
  }
}

class TestProject extends Project {
  static readonly TYPE = 'project';

  constructor(init?: Partial<TestProject>) {
    super(TestProject.TYPE, init);
  }

  get taskNames(): string[] {
    return [];
  }
}

class TestProjectRef extends ProjectRef {
  static readonly TYPE = TestProject.TYPE;

  constructor(id?: string) {
    super(TestProjectRef.TYPE, id);
  }
}

@NgModule({
  imports: [NoopAnimationsModule, UICommonModule],
  exports: [SaDeleteDialogComponent],
  declarations: [SaDeleteDialogComponent],
  entryComponents: [SaDeleteDialogComponent]
})
class DialogTestModule {}

class TestEnvironment {
  component: SaUsersComponent;
  fixture: ComponentFixture<SaUsersComponent>;

  mockedUserService: UserService;
  overlayContainer: OverlayContainer;

  private readonly users: User[] = [
    new User({
      id: 'user01',
      name: 'User 01',
      email: 'user01@example.com',
      projects: [new TestProjectUserRef('projectuser01')],
      active: true
    }),
    new User({
      id: 'user02',
      name: 'User 02',
      email: 'user02@example.com',
      active: true
    }),
    new User({
      id: 'user03',
      email: 'user03@example.com',
      projects: [new TestProjectUserRef('projectuser03')],
      active: false
    })
  ];
  private readonly included: Resource[] = [
    new TestProjectUser({ id: 'projectuser01', user: new UserRef('user01'), project: new TestProjectRef('project01') }),
    new TestProjectUser({ id: 'projectuser03', user: new UserRef('user03'), project: new TestProjectRef('project01') }),
    new TestProject({ id: 'project01', projectName: 'Project 01' })
  ];

  constructor() {
    this.mockedUserService = mock(UserService);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, RouterTestingModule, UICommonModule, DialogTestModule],
      declarations: [SaUsersComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: UserService, useFactory: () => instance(this.mockedUserService) }]
    });
    this.fixture = TestBed.createComponent(SaUsersComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  setupNullUserData(): void {
    this.setupThisUserData(null);
  }

  setupEmptyUserData(): void {
    this.setupThisUserData([]);
  }

  setupUserData(): void {
    when(this.mockedUserService.onlineSearch(anything(), anything(), anything(), anything())).thenCall(
      (term$: Observable<string>, parameters$: Observable<GetAllParameters<User>>, reload$: Observable<void>) => {
        const results = [
          // page 1
          new MapQueryResults<User[]>(this.users, this.users.length, this.included),
          // page 2
          new MapQueryResults<User[]>([this.users[2]], 1, this.included)
        ];

        return combineLatest(term$, parameters$, reload$).pipe(map((_value, index) => results[index]));
      }
    );
  }

  get loadingSpinner(): DebugElement {
    return this.fixture.debugElement.query(By.css('.loading-spinner'));
  }

  get noUsersLabel(): DebugElement {
    return this.fixture.debugElement.query(By.css('#no-users-label'));
  }

  get addUserButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#add-user-btn'));
  }

  get table(): DebugElement {
    return this.fixture.debugElement.query(By.css('#users-table'));
  }

  get userRows(): DebugElement[] {
    // querying the debug table element doesn't seem to work, so we query the native element instead and convert back
    // to debug elements
    return Array.from(this.table.nativeElement.querySelectorAll('tr')).map(r => getDebugNode(r) as DebugElement);
  }

  get filterInput(): DebugElement {
    return this.fixture.debugElement.query(By.css('input'));
  }

  get paginator(): DebugElement {
    return this.fixture.debugElement.query(By.css('mat-paginator'));
  }

  get nextPageButton(): DebugElement {
    return this.paginator.query(By.css('.mat-paginator-navigation-next'));
  }

  get deleteDialogYesButton(): HTMLButtonElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#confirm-button-yes');
  }

  get deleteDialogNoButton(): HTMLButtonElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#confirm-button-no');
  }

  get addEditPanel(): DebugElement {
    return this.fixture.debugElement.query(By.css('#add-edit-panel'));
  }

  cell(row: number, column: number): DebugElement {
    return this.userRows[row].children[column];
  }

  removeUserButtonOnRow(row: number): DebugElement {
    return this.userRows[row].query(By.css('button.remove-user'));
  }

  cancelInviteButtonOnRow(row: number): DebugElement {
    return this.userRows[row].query(By.css('button.cancel-invite'));
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }

    element.click();
    this.fixture.detectChanges();
    flush();
  }

  setInputValue(input: HTMLInputElement | DebugElement, value: string): void {
    if (input instanceof DebugElement) {
      input = (input as DebugElement).nativeElement as HTMLInputElement;
    }

    input.value = value;
    input.dispatchEvent(new Event('keyup'));
    this.fixture.detectChanges();
    flush();
  }

  private setupThisUserData(users: User[] = []): void {
    when(this.mockedUserService.onlineSearch(anything(), anything(), anything(), anything())).thenReturn(
      of(new MapQueryResults<User[]>(users, 0, this.included))
    );
  }
}
