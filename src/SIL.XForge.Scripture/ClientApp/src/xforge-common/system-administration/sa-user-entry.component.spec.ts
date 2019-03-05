import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito/lib/ts-mockito';

import { MapQueryResults } from '../json-api.service';
import { User } from '../models/user';
import { NoticeService } from '../notice.service';
import { UICommonModule } from '../ui-common.module';
import { UserService } from '../user.service';
import { SaUserEntryComponent } from './sa-user-entry.component';

class TestUserEntryComponent {
  component: SaUserEntryComponent;
  fixture: ComponentFixture<SaUserEntryComponent>;
  mockedUserService: UserService;
  mockedNoticeService: NoticeService;
  testUser = new User({
    id: 'user01',
    email: 'user01@example.com',
    name: 'User 01',
    password: 'password01',
    role: 'user',
    active: true,
    dateCreated: '2019-01-01T12:00:00.000Z',
    dateModified: '2019-01-01T12:00:00.000Z'
  });

  constructor() {
    this.mockedUserService = mock(UserService);
    this.mockedNoticeService = mock(NoticeService);
    const updatedUser = new User({
      id: 'user01',
      name: 'Updated Name',
      username: 'updatedusername'
    });
    when(this.mockedUserService.onlineUpdateAttributes(anything(), anything())).thenResolve(updatedUser);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, UICommonModule],
      declarations: [SaUserEntryComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        DatePipe
      ]
    });

    this.fixture = TestBed.createComponent(SaUserEntryComponent);
    this.component = this.fixture.componentInstance;
  }

  get title(): DebugElement {
    return this.fixture.debugElement.query(By.css('#title'));
  }

  get nameInput(): DebugElement {
    return this.fixture.debugElement.query(By.css('#full-name'));
  }

  get usernameInput(): DebugElement {
    return this.fixture.debugElement.query(By.css('#username'));
  }

  get emailInput(): DebugElement {
    return this.fixture.debugElement.query(By.css('#email'));
  }

  get dateCreated(): DebugElement {
    return this.fixture.debugElement.query(By.css('#date-created'));
  }

  get lastLogin(): DebugElement {
    return this.fixture.debugElement.query(By.css('#last-login'));
  }

  get passwordInput(): DebugElement {
    return this.fixture.debugElement.query(By.css('#password'));
  }

  get addButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#add-button'));
  }

  get updateButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#update-button'));
  }

  get changePasswordButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#changepassword-button'));
  }

  get accountUserFormDiv(): DebugElement {
    return this.fixture.debugElement.query(By.css('div[formGroupName="accountUserForm"'));
  }

  get userRoleSelect(): DebugElement {
    return this.fixture.debugElement.query(By.css('#user-role'));
  }

  changeSelectValue(select: DebugElement, option: number): void {
    select.nativeElement.click();
    this.fixture.detectChanges();
    flush();
    const options = select.queryAll(By.css('mat-option'));
    options[option].nativeElement.click();
    this.fixture.detectChanges();
    flush();
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
    input.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
    flush();
  }

  useExistingUser(): void {
    when(this.mockedUserService.onlineGet(anything())).thenReturn(of(new MapQueryResults(this.testUser)));
    // set the editUserId to display the details of the test user
    this.component.editUserId = 'user01';
    this.fixture.detectChanges();
    tick();
  }

  simulateAddUser(): void {
    // when editUserId is undefined, the component shows the form to add a new user
    this.component.editUserId = undefined;
    this.fixture.detectChanges();
    tick();
  }
}

describe('System Administration User Entry Component', () => {
  describe('Existing user account details', () => {
    it('should display page for existing user', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.useExistingUser();
      expect(env.component.editUserId).toBe('user01');
      expect(env.updateButton.nativeElement.textContent).toContain('Update');
      expect(env.title.nativeElement.textContent).toContain('Account details');
      expect(env.component.showActivateDeActivatePanel).toBe(true);
      expect(env.dateCreated.nativeElement.textContent).toContain('01 January 2019');
      expect(env.lastLogin.nativeElement.textContent).toContain('01 January 2019');
    }));

    it('should update user if form is valid', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.useExistingUser();
      expect(env.component.fullName.value).toBe('User 01');
      env.setInputValue(env.nameInput, 'Updated Name');
      env.setInputValue(env.usernameInput, 'updatedusername');
      expect(env.component.email.value).toBe('user01@example.com');
      expect(env.component.showPasswordPanel).toBe(false);
      // The user's password is not stored on the form
      expect(env.component.password.value).toBe('');
      expect(env.component.role.value).toBe('user');
      expect(env.component.activateStatus.value).toBe(true);
      env.clickElement(env.updateButton);
      verify(env.mockedUserService.onlineUpdateAttributes(anything(), anything())).once();
      verify(env.mockedNoticeService.show('User account updated.')).once();
    }));

    it('should not submit if form is invalid', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.useExistingUser();
      env.setInputValue(env.nameInput, '');
      expect(env.component.fullName.hasError('required')).toBe(true);
      env.setInputValue(env.emailInput, '');
      expect(env.component.email.hasError('required')).toBe(true);
      env.setInputValue(env.emailInput, 'notvalidemail');
      expect(env.component.email.hasError('email')).toBe(true);
      env.clickElement(env.updateButton);
      verify(env.mockedUserService.onlineUpdateAttributes(anything(), anything())).never();
    }));

    it('should report conflicts', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      when(env.mockedUserService.onlineUpdateAttributes(anything(), anything())).thenThrow(
        new MockClientError(409, 'Duplicate Email!')
      );
      env.useExistingUser();
      env.setInputValue(env.nameInput, 'Something New');
      env.clickElement(env.updateButton);
      verify(env.mockedUserService.onlineUpdateAttributes(anything(), anything())).once();
      verify(env.mockedNoticeService.show('User account could not be updated due to a conflict.')).once();
      expect().nothing();
    }));

    it('should rethrow unrecognized errors', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      when(env.mockedUserService.onlineUpdateAttributes(anything(), anything())).thenThrow(
        new Error('Ordered rabbit stew but got vegetable soup!')
      );
      env.useExistingUser();
      env.setInputValue(env.nameInput, 'Something New');
      const expected = new RegExp('.*Ordered rabbit stew but got vegetable soup!.*');
      expect(() => env.clickElement(env.updateButton)).toThrowError(expected);
    }));

    it('should allow the user to be updated when password field is untouched', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.useExistingUser();
      expect(env.component.showPasswordPanel).toBe(false);
      // The user's password is not stored on the form
      expect(env.component.password.value).toBe('');
      expect(env.component.password.hasError('required')).toBe(true);
      // The validations on the password get bypassed when showPasswordPanel is false
      env.clickElement(env.updateButton);
      verify(env.mockedUserService.onlineUpdateAttributes(anything(), anything())).once();
    }));

    it('should not update the password when the password field is untouched', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.useExistingUser();
      const passwordBefore = env.testUser.password;
      expect(env.component.password.value).toBe('');
      env.clickElement(env.updateButton);
      verify(env.mockedUserService.onlineUpdateAttributes(anything(), anything())).once();
      expect(env.testUser.password).toEqual(passwordBefore);
    }));

    it('should show the password field when the button is pressed', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.useExistingUser();
      expect(env.component.showPasswordPanel).toBe(false);
      env.clickElement(env.changePasswordButton);
      expect(env.component.showPasswordPanel).toBe(true);
    }));

    it('should update password when new password is entered', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.useExistingUser();
      expect(env.changePasswordButton.nativeElement.textContent).toContain('Change Password');
      env.clickElement(env.changePasswordButton);
      env.setInputValue(env.passwordInput, 'short');
      expect(env.component.password.hasError('minlength')).toBe(true);
      env.setInputValue(env.passwordInput, 'newvalidpassword');
      expect(env.component.password.hasError('minlength')).toBe(false);
      env.clickElement(env.updateButton);
      verify(env.mockedUserService.onlineUpdateAttributes(anything(), anything())).once();
      const [userId, partialUser] = capture(env.mockedUserService.onlineUpdateAttributes).last();
      expect(userId).toBe('user01');
      expect(partialUser.password).toBe('newvalidpassword');
    }));
  });

  describe('New user account details', () => {
    it('should display form to add a user', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.simulateAddUser();
      expect(env.addButton.nativeElement.textContent).toContain('Add');
      expect(env.title.nativeElement.textContent).toContain('New account details');
      expect(env.component.showPasswordPanel).toBe(true);
    }));

    it('should not submit if form is invalid ', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.simulateAddUser();
      env.setInputValue(env.nameInput, '');
      expect(env.component.fullName.hasError('required')).toBe(true);
      env.setInputValue(env.emailInput, 'invalidemail');
      expect(env.component.email.hasError('email')).toBe(true);
      env.setInputValue(env.emailInput, 'invalidemail@example');
      expect(env.component.email.hasError('pattern')).toBe(true);
      env.setInputValue(env.passwordInput, '');
      expect(env.component.password.hasError('required')).toBe(true);
      env.clickElement(env.addButton);
      verify(env.mockedUserService.onlineCreate(anything())).never();
      verify(env.mockedNoticeService.show(anything())).never();
    }));

    it('should submit if form is valid', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      env.simulateAddUser();
      env.setInputValue(env.nameInput, 'New Name');
      env.setInputValue(env.emailInput, 'newemail@example.com');
      env.setInputValue(env.passwordInput, 'newpassword');
      // The default role is set to be user
      expect(env.component.role.value).toBe('user');
      expect(env.component.accountUserForm.valid).toBe(true);
      env.clickElement(env.addButton);
      verify(env.mockedUserService.onlineCreate(anything())).once();
      verify(env.mockedNoticeService.show('User account created successfully.')).once();
    }));

    it('should report conflicts', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      when(env.mockedUserService.onlineCreate(anything())).thenThrow(new MockClientError(409, 'Duplicate Email!'));
      env.simulateAddUser();
      env.setInputValue(env.nameInput, 'New Name');
      env.setInputValue(env.emailInput, env.testUser.email);
      env.setInputValue(env.passwordInput, env.testUser.password);
      expect(env.component.accountUserForm.valid).toBe(true);
      env.clickElement(env.addButton);
      verify(env.mockedUserService.onlineCreate(anything())).once();
      verify(env.mockedNoticeService.show('User account could not be created due to a conflict.')).once();
    }));

    it('should rethrow unrecognized errors', fakeAsync(() => {
      const env = new TestUserEntryComponent();
      when(env.mockedUserService.onlineCreate(anything())).thenThrow(new Error('Ordered rabbit stew but got veggie!'));
      env.simulateAddUser();
      env.setInputValue(env.nameInput, 'New Name');
      env.setInputValue(env.emailInput, 'newEmail@example.com');
      env.setInputValue(env.passwordInput, 'new password');
      const expected = new RegExp('.*Ordered rabbit stew but got veggie!.*');
      expect(() => env.clickElement(env.addButton)).toThrowError(expected);
    }));
  });
});

class MockClientError extends Error {
  readonly response: any;

  constructor(responseCode: number, message?: string) {
    super(message);
    this.response = { status: responseCode };
  }
}
