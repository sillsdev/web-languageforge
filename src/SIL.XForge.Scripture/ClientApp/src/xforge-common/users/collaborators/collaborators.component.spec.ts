import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { GetAllParameters, MapQueryResults } from '../../json-api.service';
import { Project, ProjectRef } from '../../models/project';
import { ProjectUser, ProjectUserRef } from '../../models/project-user';
import { User, UserRef } from '../../models/user';
import { NoticeService } from '../../notice.service';
import { InviteAction, ProjectService } from '../../project.service';
import { UICommonModule } from '../../ui-common.module';
import { UserService } from '../../user.service';
import { nameof } from '../../utils';
import { CollaboratorsComponent } from './collaborators.component';

describe('CollaboratorsComponent', () => {
  it('should display menu when user begins typing', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTextFieldValue(env.searchUserInput, 'u');
    expect(env.component.userMenu.open).toBe(false);
    env.setTextFieldValue(env.searchUserInput, 'use');
    expect(env.component.userMenu.open).toBe(true);
    expect(env.component.users.length).toEqual(3);
    expect(env.component.usersInProject.length).toEqual(1);
    expect(env.component.usersInProject[0].id).toBe('user01');
    expect(env.menuItemExists(env.searchMenuElement, 0, 'User 02 (user02@example.com)')).toBe(true);
  }));

  it('should enable add button', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedProjectService.onlineInvite(anything())).thenResolve(InviteAction.Joined);
    env.setTextFieldValue(env.searchUserInput, 'user 02');
    expect(env.menuItemExists(env.searchMenuElement, 0, 'User 02 (user02@example.com)')).toBe(true);

    // The add button is disabled until the user selects a user from the menu
    expect(env.component.addDisabled).toBe(true);
    env.clickMenuItem(env.searchMenuElement, 0);
    const email = 'user02@example.com';
    expect(env.component.userSelectionForm.value.user).toBe(email);
    expect(env.component.addDisabled).toBe(false);
    env.clickButton(env.addButton);
    verify(env.mockedProjectService.onlineInvite(email)).once();
    const message = 'An email has been sent to ' + email + ' adding them to this project.';
    verify(env.mockedNoticeService.show(deepEqual(message))).once();
  }));

  it('should display error when email is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTextFieldValue(env.emailInput, 'notavalidemail');
    expect(env.component.userInviteForm.controls.email.hasError('email')).toBe(true);
    env.setTextFieldValue(env.emailInput, 'notavalidemail@bad');
    expect(env.component.userInviteForm.controls.email.hasError('email'));

    // A error will show explaining that existing users must be added
    env.setTextFieldValue(env.emailInput, 'user01@example.com');
    expect(env.component.userInviteForm.hasError('invite-disallowed'));
    expect(env.component.inviteDisabled).toBe(true);
    expect(env.inviteError.textContent).toContain('Please use Add');
  }));

  it('should enable invite button', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedProjectService.onlineInvite(anything())).thenResolve(InviteAction.Invited);
    expect(env.component.inviteDisabled).toBe(true);
    const newEmail = 'user04@example.com';
    env.setTextFieldValue(env.emailInput, newEmail);
    expect(env.component.inviteDisabled).toBe(false);
    env.clickButton(env.inviteButton);
    verify(env.mockedProjectService.onlineInvite(newEmail)).once();
    const message = 'An invitation email has been sent to ' + newEmail + '.';
    verify(env.mockedNoticeService.show(deepEqual(message))).once();
  }));
});

class TestProject extends Project {
  static readonly TYPE = 'project';

  constructor(init?: Partial<Project>) {
    super(TestProject.TYPE, init);
  }

  get taskNames(): string[] {
    return ['Task1', 'Task2'];
  }
}
class TestProjectUser extends ProjectUser {
  static readonly TYPE = 'projectUser';

  constructor(init?: Partial<ProjectUser>) {
    super(TestProjectUser.TYPE, init);
  }
}
class TestProjectRef extends ProjectRef {
  static readonly TYPE = TestProject.TYPE;

  constructor(id: string) {
    super(TestProjectRef.TYPE, id);
  }
}
class TestProjectUserRef extends ProjectUserRef {
  static readonly TYPE = TestProjectUser.TYPE;

  constructor(id: string) {
    super(TestProjectUser.TYPE, id);
  }
}

class TestEnvironment {
  fixture: ComponentFixture<CollaboratorsComponent>;
  component: CollaboratorsComponent;

  mockedActivatedRoute: ActivatedRoute = mock(ActivatedRoute);
  mockedNoticeService: NoticeService = mock(NoticeService);
  mockedProjectService: ProjectService = mock(ProjectService);
  mockedUserService: UserService = mock(UserService);

  private readonly users: User[] = [
    new User({
      id: 'user01',
      name: 'User 01',
      email: 'user01@example.com',
      canonicalEmail: 'user01@example.com',
      active: true
    }),
    new User({
      id: 'user02',
      name: 'User 02',
      email: 'user02@example.com',
      canonicalEmail: 'user02@example.com',
      active: true
    }),
    new User({
      id: 'user03',
      name: 'User 03',
      email: 'user03@example.com',
      canonicalEmail: 'user03@example.com',
      active: false
    })
  ];

  constructor() {
    const parameters = { ['projectId']: 'testproject01' } as Params;
    when(this.mockedActivatedRoute.params).thenReturn(of(parameters));
    when(this.mockedProjectService.get(anything(), anything())).thenReturn(of());
    this.setupProjectData();
    this.setupUserData();
    TestBed.configureTestingModule({
      declarations: [CollaboratorsComponent],
      imports: [UICommonModule],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: ProjectService, useFactory: () => instance(this.mockedProjectService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) }
      ]
    }).compileComponents();

    this.fixture = TestBed.createComponent(CollaboratorsComponent);
    this.component = this.fixture.componentInstance;

    this.fixture.detectChanges();
    tick();
  }

  get addButton(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#btn-add');
  }

  get emailInput(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#email-input');
  }

  get inviteButton(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#btn-invite');
  }

  get inviteError(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#invite-error');
  }

  get searchMenuElement(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#search-menu');
  }

  get searchUserInput(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#user-search');
  }

  get title(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#collaborators-label');
  }

  clickButton(element: HTMLElement) {
    element.click();
    this.fixture.detectChanges();
    tick();
  }

  clickMenuItem(menu: HTMLElement, index: number) {
    const items = menu.querySelectorAll('mdc-list-item');
    const item = items.item(index) as HTMLElement;
    item.click();
    item.dispatchEvent(new Event('click'));
    this.fixture.detectChanges();
    flush();
  }

  menuItemExists(menu: HTMLElement, index: number, value: string): boolean {
    const items = menu.querySelectorAll('mdc-list-item');
    return items.item(index).textContent === value;
  }

  setTextFieldValue(element: HTMLElement, value: string) {
    const inputElem: HTMLInputElement = element.querySelector('input');
    inputElem.value = value;
    inputElem.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
    tick();
  }

  setupUserData(): void {
    when(this.mockedUserService.onlineSearch(anything(), anything(), anything())).thenCall(
      (term$: Observable<string>, parameters$: Observable<GetAllParameters<User>>, reload$: Observable<void>) => {
        const results = new MapQueryResults<User[]>(this.users, this.users.length);

        return combineLatest(term$, parameters$, reload$).pipe(map(_value => results));
      }
    );
  }

  setupProjectData(): void {
    when(this.mockedProjectService.get(anything(), deepEqual([[nameof<Project>('users')]]))).thenReturn(
      of(
        new MapQueryResults(
          new TestProject({
            id: 'testproject01',
            users: [new TestProjectUserRef('projectuser01')]
          }),
          undefined,
          [
            new TestProjectUser({
              id: 'projectuser01',
              user: new UserRef('user01'),
              project: new TestProjectRef('testproject01')
            })
          ]
        )
      )
    );
  }
}
