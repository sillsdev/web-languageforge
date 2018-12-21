import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { RecordIdentity } from '@orbit/data';
import { of } from 'rxjs';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from '@xforge-common/auth.service';
import { QueryResults } from '@xforge-common/json-api.service';
import { Resource } from '@xforge-common/models/resource';
import { User } from '@xforge-common/models/user';
import { NoticeService } from '@xforge-common/notice.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { UserService } from '@xforge-common/user.service';
import { SFUser } from '../core/models/sfuser';
import { ParatextService } from '../core/paratext.service';
import { SFUserService } from '../core/sfuser.service';
import { ChangingUsernameDialogComponent } from './changing-username-dialog/changing-username-dialog.component';
import { MyAccountComponent } from './my-account.component';

export class StubQueryResults<T> implements QueryResults<T> {
  constructor(public readonly results: T, public readonly totalPagedCount?: number) {}

  getIncluded<TInclude extends Resource>(_identity: RecordIdentity): TInclude {
    return null;
  }

  getManyIncluded<TInclude extends Resource>(_identities: RecordIdentity[]): TInclude[] {
    return null;
  }
}

/**
 * This helps set entry components so can test using ChangingUsernameDialogComponent.
 */
@NgModule({
  declarations: [MyAccountComponent, ChangingUsernameDialogComponent],
  imports: [NoopAnimationsModule, RouterTestingModule, UICommonModule],
  exports: [MyAccountComponent, ChangingUsernameDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ShowOnDirtyErrorStateMatcher helps form errors show up during unit testing.
  providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
  entryComponents: [MyAccountComponent, ChangingUsernameDialogComponent]
})
class TestModule {}

class TestEnvironment {
  component: MyAccountComponent;
  fixture: ComponentFixture<MyAccountComponent>;

  mockedSFUserService: SFUserService;
  mockedParatextService: ParatextService;
  mockedMatDialog: MatDialog;
  mockedMatDialogRefForCUDC: MatDialogRef<ChangingUsernameDialogComponent>;
  mockedNoticeService: NoticeService;
  mockedAuthService: AuthService;

  private substituteParatextUsername: string;

  constructor(public userInDatabase: SFUser) {
    this.mockedSFUserService = mock(SFUserService);
    this.mockedParatextService = mock(ParatextService);
    this.mockedMatDialog = mock(MatDialog);
    this.mockedMatDialogRefForCUDC = mock(MatDialogRef);
    this.mockedNoticeService = mock(NoticeService);
    this.mockedAuthService = mock(AuthService);

    when(this.mockedSFUserService.getCurrentUser()).thenReturn(of(new StubQueryResults(this.userInDatabase)));
    when(this.mockedSFUserService.currentUserId).thenReturn('user01');
    when(this.mockedParatextService.getParatextUsername()).thenReturn(of(this.substituteParatextUsername));
    when(this.mockedSFUserService.onlineUnlinkParatextAccount()).thenCall(() => {
      this.setParatextUsername(null);
      return Promise.resolve();
    });
    when(this.mockedMatDialogRefForCUDC.afterClosed()).thenReturn(of('update'));
    when(this.mockedMatDialog.open(anything(), anything())).thenReturn(instance(this.mockedMatDialogRefForCUDC));

    when(this.mockedNoticeService.push(anything(), anything())).thenReturn('aa');

    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedSFUserService) },
        { provide: ParatextService, useFactory: () => instance(this.mockedParatextService) },
        { provide: MatDialog, useFactory: () => instance(this.mockedMatDialog) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) }
      ],
      declarations: []
    }).compileComponents();

    this.fixture = TestBed.createComponent(MyAccountComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }

  /** Handler for mockUserService.updateUserAttributes that updates the fake database. */
  mockUserServiceUpdateUserAttributes(): (updatedAttributes: Partial<User>) => Promise<User> {
    return (updatedAttributes: Partial<User>) => {
      return new Promise<User>(resolve => {
        setTimeout(() => {
          for (const property of ['name', 'username', 'email', 'mobilePhone', 'contactMethod', 'birthday', 'gender']) {
            if (updatedAttributes[property] !== undefined) {
              this.userInDatabase[property] = updatedAttributes[property];
            }
          }
          resolve();
        }, 0);
      });
    };
  }

  /** After calling, flush(); to make the database promise resolve. */
  clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
  }

  buttonIcon(controlName: string): DebugElement {
    return this.fixture.debugElement.query(By.css(`#${controlName}-button-icon`));
  }

  setParatextUsername(name: string): void {
    this.substituteParatextUsername = name;
    this.component.paratextUsername = this.substituteParatextUsername;
  }

  spinner(controlName: string): DebugElement {
    return this.fixture.debugElement.query(By.css(`#${controlName}-update-spinner`));
  }

  greenCheck(controlName: string): DebugElement {
    return this.fixture.debugElement.query(By.css(`#${controlName}-update-done`));
  }

  errorIcon(controlName: string): DebugElement {
    return this.fixture.debugElement.query(By.css(`#${controlName}-error-icon`));
  }

  updateButton(controlName: string): DebugElement {
    return this.fixture.debugElement.query(By.css(`#${controlName}-update-button`));
  }

  contactMethodToggle(toggleName: string): DebugElement {
    return this.fixture.debugElement.query(By.css(`mat-button-toggle[value="${toggleName}"]`));
  }

  get matErrors(): Array<DebugElement> {
    return this.fixture.debugElement.queryAll(By.css('mat-error'));
  }

  get header2(): HTMLElement {
    return this.fixture.nativeElement.querySelector('h2');
  }

  get paratextLinkElement(): DebugElement {
    return this.fixture.debugElement.query(By.css('#paratext-link'));
  }

  get paratextLinkLabel(): DebugElement {
    return this.fixture.debugElement.query(By.css('#paratext-link-label'));
  }

  get connectParatextButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#connect-paratext-button'));
  }

  get unlinkParatextButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#unlink-paratext-button'));
  }

  get deleteAccountElement(): DebugElement {
    return this.fixture.debugElement.query(By.css('#delete-account'));
  }

  get deleteAccountButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#delete-account-button'));
  }

  get avatars(): DebugElement[] {
    return this.fixture.debugElement.queryAll(By.css('app-avatar'));
  }
}

describe('MyAccountComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment(
      new SFUser({
        name: 'bob smith',
        username: 'bobusername',
        email: 'bob@example.com',
        contactMethod: 'email',
        mobilePhone: '+123 11 2222-33-4444'
      })
    );
  });

  it('should have a relevant title', () => {
    const title = env.fixture.debugElement.componentInstance.title;
    expect(title).toEqual('Account details - Scripture Forge');
    const header = env.header2.textContent;
    expect(header).toEqual('Account details');
  });

  it('should have avatar', () => {
    expect(env.avatars.length).toBeGreaterThan(0);
  });

  // This tests that various UI icons etc are shown or not shown,
  // as data is edited and submitted, such as
  // the update button being disabled, the green check icon,
  // arrow icon, and spinner.
  // The test goes thru a sequence of actions, verifying state and icons.
  it('should update spinner, arrow, check, and disabled, depending on activity', fakeAsync(() => {
    when(env.mockedSFUserService.updateUserAttributes({ name: 'robert' })).thenReturn(
      new Promise<User>(resolve => {
        setTimeout(() => {
          env.userInDatabase.name = 'robert';
          resolve();
        }, 0);
      })
    );

    when(env.mockedSFUserService.updateUserAttributes(anything())).thenReturn(
      new Promise<User>(resolve => {
        setTimeout(() => {
          resolve();
        }, 0);
      })
    );

    const originalName = env.component.userFromDatabase.name;
    expect(env.component.formGroup.get('name').value).toEqual(originalName, 'test setup problem');

    verifyStates(
      env,
      'name',
      {
        state: env.component.elementState.InSync,
        updateButtonEnabled: false,
        arrow: true,
        spinner: false,
        greenCheck: false,
        errorIcon: false,
        inputEnabled: true
      },
      env.updateButton('name').nativeElement
    );

    // change name on page
    const newName = 'robert';
    expect(originalName).not.toBe(newName, 'test set up wrong');
    env.component.formGroup.get('name').setValue(newName);
    env.fixture.detectChanges();

    verifyStates(
      env,
      'name',
      {
        state: env.component.elementState.Dirty,
        updateButtonEnabled: true,
        arrow: true,
        spinner: false,
        greenCheck: false,
        errorIcon: false,
        inputEnabled: true
      },
      env.updateButton('name').nativeElement
    );

    // click update
    env.clickButton(env.updateButton('name'));

    verifyStates(
      env,
      'name',
      {
        state: env.component.elementState.Submitting,
        updateButtonEnabled: false,
        arrow: false,
        spinner: true,
        greenCheck: false,
        errorIcon: false,
        inputEnabled: false
      },
      env.updateButton('name').nativeElement
    );

    // The spinner shows during networking. Time passes. Finish networking with flush()
    // before checking that the spinner is gone.
    flush();
    env.fixture.detectChanges();

    verifyStates(
      env,
      'name',
      {
        state: env.component.elementState.Submitted,
        updateButtonEnabled: false,
        arrow: false,
        spinner: false,
        greenCheck: true,
        errorIcon: false,
        inputEnabled: true
      },
      env.updateButton('name').nativeElement
    );

    // We don't need to test the fake database, but this failing is an early indication
    // of what may be about to go wrong.
    expect(env.component.userFromDatabase.name).toBe(newName);

    // modify text
    const newerName = 'Bobby';
    env.component.formGroup.get('name').setValue(newerName);
    env.fixture.detectChanges();

    verifyStates(
      env,
      'name',
      {
        state: env.component.elementState.Dirty,
        updateButtonEnabled: true,
        arrow: true,
        spinner: false,
        greenCheck: false,
        errorIcon: false,
        inputEnabled: true
      },
      env.updateButton('name').nativeElement
    );

    // Modify text back to what it is in the database. In other words, manually editing
    // it back to a 'clean state'.
    env.component.formGroup.get('name').setValue(newName);
    env.fixture.detectChanges();

    verifyStates(
      env,
      'name',
      {
        state: env.component.elementState.InSync,
        updateButtonEnabled: false,
        arrow: true,
        spinner: false,
        greenCheck: false,
        errorIcon: false,
        inputEnabled: true
      },
      env.updateButton('name').nativeElement
    );
  }));

  it('handles network error', fakeAsync(() => {
    const technicalDetails = 'squirrel chewed thru line. smoke lost.';
    when(env.mockedSFUserService.updateUserAttributes(anything())).thenReject({ stack: technicalDetails });

    const originalName = env.component.userFromDatabase.name;
    expect(env.component.formGroup.get('name').value).toEqual(originalName, 'test setup problem');

    // change name on page
    const newName = 'robert';
    expect(originalName).not.toEqual(newName, 'test set up wrong');
    env.component.formGroup.get('name').setValue(newName);
    env.fixture.detectChanges();

    // click update
    env.clickButton(env.updateButton('name'));

    // Time passes
    flush();
    env.fixture.detectChanges();

    verifyStates(
      env,
      'name',
      {
        state: env.component.elementState.Error,
        updateButtonEnabled: true,
        arrow: false,
        spinner: false,
        greenCheck: false,
        errorIcon: true,
        inputEnabled: true
      },
      env.updateButton('name').nativeElement
    );

    expect(env.component.formGroup.get('name').value).toEqual(
      newName,
      'input should contain new name that failed to transmit'
    );

    // Check error notice shown to user
    const [type, title, details] = capture(env.mockedNoticeService.push).last();
    expect(type).toEqual(NoticeService.ERROR);
    expect(title).toContain('Error', 'error notice not shown to user');
    expect(details).toContain('Internet');
    expect(details).toContain(technicalDetails);
    verify(env.mockedNoticeService.push(anything(), anything(), anything())).once();
  }));

  it('handles network error for non-text inputs', fakeAsync(() => {
    const technicalDetails = 'squirrel chewed thru line. smoke lost.';
    when(env.mockedSFUserService.updateUserAttributes(anything())).thenReject({ stack: technicalDetails });

    const originalvalue = env.component.userFromDatabase.contactMethod;
    expect(env.component.formGroup.get('contactMethod').value).toEqual(originalvalue, 'test setup problem');

    // change value on page
    const newValue = 'sms';
    expect(originalvalue).not.toEqual(newValue, 'test set up wrong');
    env.component.formGroup.get('contactMethod').setValue(newValue);
    env.fixture.detectChanges();

    env.clickButton(env.contactMethodToggle('sms'));
    expect(env.component.formGroup.get('contactMethod').value).toEqual(newValue, 'test setup problem');

    verifyStates(env, 'contactMethod', {
      state: env.component.elementState.Submitting,
      spinner: true,
      greenCheck: false,
      errorIcon: false,
      inputEnabled: false
    });

    // Time passes
    flush();
    env.fixture.detectChanges();
    expect(env.component.userFromDatabase.contactMethod).toEqual(originalvalue, 'test setup problem?');

    expect(env.component.formGroup.get('contactMethod').value).toEqual(
      originalvalue,
      'should have set form value back to original value'
    );

    verifyStates(env, 'contactMethod', {
      state: env.component.elementState.Error,
      spinner: false,
      greenCheck: false,
      errorIcon: true,
      inputEnabled: true
    });
  }));

  describe('validation', () => {
    it('no error if email address is entered and deleted, if not set in database', fakeAsync(() => {
      env.userInDatabase.email = '';
      env.component.formGroup.get('email').setValue(env.userInDatabase.email);
      env.fixture.detectChanges();
      expect(env.component.userFromDatabase.email.length).toEqual(0, 'test not set up');
      expect(env.component.userFromDatabase.username.length).toBeGreaterThan(3, 'test not set up');
      expect(env.component.formGroup.get('email').value).toEqual('', 'test not set up');

      verifyStates(
        env,
        'email',
        {
          state: env.component.elementState.InSync,
          updateButtonEnabled: false,
          arrow: true,
          spinner: false,
          greenCheck: false,
          errorIcon: false,
          inputEnabled: true
        },
        env.updateButton('email').nativeElement
      );

      // Enter email on form
      env.component.formGroup.get('email').setValue('me@example.com');
      env.component.formGroup.get('email').markAsDirty();
      env.fixture.detectChanges();

      // Delete email from form
      env.component.formGroup.get('email').setValue('');
      env.component.formGroup.get('email').markAsDirty();
      env.fixture.detectChanges();

      verifyStates(
        env,
        'email',
        {
          state: env.component.elementState.InSync,
          updateButtonEnabled: false,
          arrow: true,
          spinner: false,
          greenCheck: false,
          errorIcon: false,
          inputEnabled: true
        },
        env.updateButton('email').nativeElement
      );

      // Expect no error message
      expect(env.matErrors.length).toEqual(0);
    }));

    it('error if email address removed, and is set in database', fakeAsync(() => {
      expect(env.component.userFromDatabase.email.length).toBeGreaterThan(3, 'test not set up');

      // Delete email from form
      env.component.formGroup.get('email').setValue('');
      env.component.formGroup.get('email').markAsDirty();
      env.fixture.detectChanges();

      verifyStates(
        env,
        'email',
        {
          state: env.component.elementState.Invalid,
          updateButtonEnabled: false,
          arrow: true,
          spinner: false,
          greenCheck: false,
          errorIcon: false,
          inputEnabled: true
        },
        env.updateButton('email').nativeElement
      );

      // Expect specific error message
      expect(env.matErrors.length).toEqual(1);
      expect((env.matErrors[0].nativeElement as HTMLElement).innerText).toContain('must supply a valid email');
    }));

    it('no error if username removed when email is set on form and in database', fakeAsync(() => {
      expect(env.component.userFromDatabase.email.length).toBeGreaterThan(3, 'test not set up');
      expect(env.component.userFromDatabase.username.length).toBeGreaterThan(3, 'test not set up');
      expect(env.component.formGroup.get('email').value.length).toBeGreaterThan(3, 'test not set up');

      // Delete username from form
      env.component.formGroup.get('username').setValue('');
      env.component.formGroup.get('username').markAsDirty();
      env.fixture.detectChanges();

      verifyStates(
        env,
        'username',
        {
          state: env.component.elementState.Dirty,
          updateButtonEnabled: true,
          arrow: true,
          spinner: false,
          greenCheck: false,
          errorIcon: false,
          inputEnabled: true
        },
        env.updateButton('username').nativeElement
      );

      // Expect no error message
      expect(env.matErrors.length).toEqual(0);
    }));

    it('error if username removed when no email', fakeAsync(() => {
      env.userInDatabase.email = '';
      env.component.formGroup.get('email').setValue(env.userInDatabase.email);
      env.component.formGroup.get('email').markAsDirty();
      env.fixture.detectChanges();
      expect(env.component.userFromDatabase.email.length).toEqual(0, 'test not set up');
      expect(env.component.userFromDatabase.username.length).toBeGreaterThan(3, 'test not set up');
      expect(env.component.formGroup.get('email').value).toEqual('', 'test not set up');

      // Delete username from form
      env.component.formGroup.get('username').setValue('');
      env.component.formGroup.get('username').markAsDirty();
      env.fixture.detectChanges();

      verifyStates(
        env,
        'username',
        {
          state: env.component.elementState.Invalid,
          updateButtonEnabled: false,
          arrow: true,
          spinner: false,
          greenCheck: false,
          errorIcon: false,
          inputEnabled: true
        },
        env.updateButton('username').nativeElement
      );

      // Expect specific error message
      expect(env.matErrors.length).toEqual(1);
      expect((env.matErrors[0].nativeElement as HTMLElement).innerText).toContain('unless email');
    }));

    it('error if username is removed, when no email in database, even if email is typed on form', fakeAsync(() => {
      // Don't let user click Update in this situation.

      env.userInDatabase.email = '';
      env.component.formGroup.get('email').setValue(env.userInDatabase.email);
      env.component.formGroup.get('email').markAsDirty();
      env.fixture.detectChanges();
      expect(env.component.userFromDatabase.email.length).toEqual(0, 'test not set up');
      expect(env.component.userFromDatabase.username.length).toBeGreaterThan(3, 'test not set up');
      expect(env.component.formGroup.get('email').value).toEqual('', 'test not set up');

      verifyStates(
        env,
        'username',
        {
          state: env.component.elementState.InSync,
          updateButtonEnabled: false,
          arrow: true,
          spinner: false,
          greenCheck: false,
          errorIcon: false,
          inputEnabled: true
        },
        env.updateButton('username').nativeElement
      );

      // Enter email on form
      env.component.formGroup.get('email').setValue('me@example.com');
      env.component.formGroup.get('email').markAsDirty();
      env.fixture.detectChanges();

      // Delete username from form
      env.component.formGroup.get('username').setValue('');
      env.component.formGroup.get('username').markAsDirty();
      env.fixture.detectChanges();

      verifyStates(
        env,
        'username',
        {
          state: env.component.elementState.Invalid,
          updateButtonEnabled: false,
          arrow: true,
          spinner: false,
          greenCheck: false,
          errorIcon: false,
          inputEnabled: true
        },
        env.updateButton('username').nativeElement
      );

      // Expect specific error message
      expect(env.matErrors.length).toEqual(1);
      expect((env.matErrors[0].nativeElement as HTMLElement).innerText).toContain('unless email');
    }));

    it('only show email error when both email and username are removed', fakeAsync(() => {
      // Don't bother showing error for username field since the email address can't be
      // removed anyway and so there's not really an error situation for the proposed username.

      expect(env.component.userFromDatabase.email.length).toBeGreaterThan(3, 'test not set up');
      expect(env.component.userFromDatabase.username.length).toBeGreaterThan(3, 'test not set up');

      // Delete email from form
      env.component.formGroup.get('email').setValue('');
      env.component.formGroup.get('email').markAsDirty();
      env.fixture.detectChanges();

      // Delete username from form
      env.component.formGroup.get('username').setValue('');
      env.component.formGroup.get('username').markAsDirty();
      env.fixture.detectChanges();

      verifyStates(
        env,
        'username',
        {
          state: env.component.elementState.Dirty,
          updateButtonEnabled: true,
          arrow: true,
          spinner: false,
          greenCheck: false,
          errorIcon: false,
          inputEnabled: true
        },
        env.updateButton('username').nativeElement
      );

      // Expect specific error message
      expect(env.matErrors.length).toEqual(1, 'should have only showed one error message, not both');
      expect((env.matErrors[0].nativeElement as HTMLElement).innerText).toContain(
        'must supply a valid email',
        'should be email error message, not username error message'
      );
    }));
  });

  describe('contactMethod restrictions', () => {
    it('cannot select email if no email address is set', fakeAsync(() => {
      env.userInDatabase.email = '';
      env.userInDatabase.contactMethod = 'sms';
      env.component.reloadFromDatabase();
      env.fixture.detectChanges();
      expect(env.component.userFromDatabase.email).toEqual('', 'setup');
      expect(env.component.formGroup.get('email').value).toEqual('', 'setup');
      expect(env.component.userFromDatabase.contactMethod).not.toEqual('email', 'setup');
      expect(env.component.formGroup.get('contactMethod').value).not.toEqual('email', 'setup');

      expect(env.contactMethodToggle('email').nativeElement.firstChild.disabled).toBe(true);
      expect(env.contactMethodToggle('emailSms').nativeElement.firstChild.disabled).toBe(true);
    }));

    it('cannot select sms if no mobile phone number is set', fakeAsync(() => {
      env.userInDatabase.mobilePhone = '';
      env.userInDatabase.contactMethod = 'email';
      env.component.reloadFromDatabase();
      env.fixture.detectChanges();
      expect(env.component.userFromDatabase.mobilePhone).toEqual('', 'setup');
      expect(env.component.formGroup.get('mobilePhone').value).toEqual('', 'setup');
      expect(env.component.userFromDatabase.contactMethod).not.toEqual('sms', 'setup');
      expect(env.component.formGroup.get('contactMethod').value).not.toEqual('sms', 'setup');

      expect(env.contactMethodToggle('sms').nativeElement.firstChild.disabled).toBe(true);
      expect(env.contactMethodToggle('emailSms').nativeElement.firstChild.disabled).toBe(true);
    }));

    it('cannot select email or sms if no email address or phone is set', fakeAsync(() => {
      env.userInDatabase.email = '';
      env.userInDatabase.mobilePhone = '';
      env.userInDatabase.contactMethod = null;
      env.component.reloadFromDatabase();
      env.fixture.detectChanges();
      expect(env.component.userFromDatabase.email).toEqual('', 'setup');
      expect(env.component.formGroup.get('email').value).toEqual('', 'setup');
      expect(env.component.userFromDatabase.mobilePhone).toEqual('', 'setup');
      expect(env.component.formGroup.get('mobilePhone').value).toEqual('', 'setup');
      expect(env.component.userFromDatabase.contactMethod).toEqual(null, 'setup');
      expect(env.component.formGroup.get('contactMethod').value).toEqual(null, 'setup');

      expect(env.contactMethodToggle('sms').nativeElement.firstChild.disabled).toBe(true);
      expect(env.contactMethodToggle('email').nativeElement.firstChild.disabled).toBe(true);
      expect(env.contactMethodToggle('emailSms').nativeElement.firstChild.disabled).toBe(true);
    }));

    it('deleting phone number disables and unsets sms contact method', fakeAsync(() => {
      when(env.mockedSFUserService.updateUserAttributes(anything())).thenCall(
        env.mockUserServiceUpdateUserAttributes()
      );

      env.userInDatabase.contactMethod = 'sms';
      env.component.reloadFromDatabase();
      env.fixture.detectChanges();
      expect(env.component.userFromDatabase.mobilePhone.length).toBeGreaterThan(3, 'setup');
      expect(env.component.formGroup.get('mobilePhone').value.length).toBeGreaterThan(3, 'setup');
      expect(env.component.userFromDatabase.contactMethod).toEqual('sms', 'setup');
      expect(env.component.formGroup.get('contactMethod').value).toEqual('sms', 'setup');

      expect(env.contactMethodToggle('sms').nativeElement.firstChild.disabled).toBe(false);

      env.component.formGroup.get('mobilePhone').setValue('');
      env.component.formGroup.get('mobilePhone').markAsDirty();
      env.fixture.detectChanges();

      // Don't disable sms yet until phone is committed.
      expect(env.contactMethodToggle('sms').nativeElement.firstChild.disabled).toBe(false);

      env.clickButton(env.updateButton('mobilePhone'));
      flush();
      env.fixture.detectChanges();

      expect(env.contactMethodToggle('sms').nativeElement.firstChild.disabled).toBe(true);
      expect(env.contactMethodToggle('emailSms').nativeElement.firstChild.disabled).toBe(true);
      expect(env.component.userFromDatabase.contactMethod).toEqual(null);
      expect(env.component.formGroup.get('contactMethod').value).toEqual(null); // or at least not sms or emailSms
      expect(env.component.controlStates.get('contactMethod')).toBe(env.component.elementState.InSync);
    }));

    it('deleting phone number does not disable or unset email contact method', fakeAsync(() => {
      when(env.mockedSFUserService.updateUserAttributes(anything())).thenCall(
        env.mockUserServiceUpdateUserAttributes()
      );

      env.userInDatabase.contactMethod = 'email';
      env.component.reloadFromDatabase();
      env.fixture.detectChanges();
      expect(env.component.userFromDatabase.mobilePhone.length).toBeGreaterThan(3, 'setup');
      expect(env.component.formGroup.get('mobilePhone').value.length).toBeGreaterThan(3, 'setup');
      expect(env.component.userFromDatabase.contactMethod).toEqual('email', 'setup');
      expect(env.component.formGroup.get('contactMethod').value).toEqual('email', 'setup');

      expect(env.contactMethodToggle('email').nativeElement.firstChild.disabled).toBe(false);

      env.component.formGroup.get('mobilePhone').setValue('');
      env.component.formGroup.get('mobilePhone').markAsDirty();
      env.fixture.detectChanges();

      expect(env.contactMethodToggle('email').nativeElement.firstChild.disabled).toBe(false);

      env.clickButton(env.updateButton('mobilePhone'));
      flush();
      env.fixture.detectChanges();

      expect(env.contactMethodToggle('sms').nativeElement.firstChild.disabled).toBe(true);
      expect(env.contactMethodToggle('emailSms').nativeElement.firstChild.disabled).toBe(true);
      expect(env.contactMethodToggle('email').nativeElement.firstChild.disabled).toBe(false);
      expect(env.component.userFromDatabase.contactMethod).toEqual('email');
      expect(env.component.formGroup.get('contactMethod').value).toEqual('email');
      expect(env.component.controlStates.get('contactMethod')).toBe(env.component.elementState.InSync);
    }));
  });

  describe('changing username dialog', () => {
    it('should open', fakeAsync(() => {
      when(env.mockedSFUserService.updateUserAttributes(anything())).thenReturn(
        new Promise<User>(resolve => {
          setTimeout(() => {
            resolve();
          }, 0);
        })
      );

      // Change username input so button is clickable and not disabled.
      env.component.formGroup.get('username').setValue('newusername');
      env.fixture.detectChanges();
      flush();

      // Click update
      // SUT
      env.clickButton(env.updateButton('username'));

      verify(env.mockedMatDialog.open(anything(), anything())).once();
      expect().nothing();
    }));

    it('should update if requested', fakeAsync(() => {
      when(env.mockedSFUserService.updateUserAttributes(anything())).thenReturn(
        new Promise<User>(resolve => {
          setTimeout(() => {
            resolve();
          }, 0);
        })
      );

      const originalUsername = 'originalBob';
      const newUsername = 'newBob';

      env.component.userFromDatabase = new SFUser({ username: originalUsername });
      env.component.formGroup.controls.username.setValue(newUsername);
      // Verify test is set up right
      expect(env.component.userFromDatabase.username).toEqual(originalUsername);
      expect(env.component.userFromDatabase.username).not.toEqual(newUsername);

      // SUT
      env.component.updateClicked('username');
      flush();

      const [argsToUpdateUserAttributes] = capture(env.mockedSFUserService.updateUserAttributes).last();
      const expectedArgument: Partial<SFUser> = {};
      expectedArgument.username = newUsername;
      expect(argsToUpdateUserAttributes).toEqual(expectedArgument);

      // And we don't need to go on to test that the value was updated in the fake database
      // because that would just test how well we set up the mock database.
    }));

    it('should not update if cancelled', () => {
      when(env.mockedSFUserService.updateUserAttributes(anything())).thenReturn(
        new Promise<User>(resolve => {
          setTimeout(() => {
            resolve();
          }, 0);
        })
      );

      const originalUsername = 'originalBob';
      const newUsername = 'newBob';

      when(env.mockedMatDialogRefForCUDC.afterClosed()).thenReturn(of('cancel'));
      when(env.mockedMatDialog.open(anything(), anything())).thenReturn(instance(env.mockedMatDialogRefForCUDC));

      env.component.userFromDatabase = new SFUser({ username: originalUsername });
      env.component.formGroup.controls.username.setValue(newUsername);
      // Verify test is set up right
      expect(env.component.userFromDatabase.username).toEqual(originalUsername);
      expect(env.component.userFromDatabase.username).not.toEqual(newUsername);

      // SUT
      env.component.updateClicked('username');

      expect(env.component.formGroup.controls.username.value).toEqual(
        newUsername,
        'input should still have new and dirty data'
      );
      verify(env.mockedSFUserService.updateUserAttributes(anything())).never();
    });
  });

  describe('Linked accounts', () => {
    it('should give the option to link a paratext account', fakeAsync(() => {
      expect(env.component.isLinkedToParatext).toBeFalsy();
      expect(env.connectParatextButton.nativeElement.textContent).toContain('Connect to Paratext');
      env.setParatextUsername('Johnny Paratext');
      env.fixture.detectChanges();
      expect(env.paratextLinkLabel.nativeElement.textContent).toContain('Johnny Paratext');
      expect(env.unlinkParatextButton.nativeElement.textContent).toContain('Remove link');
    }));

    it('should remove linked paratext account', fakeAsync(() => {
      env.setParatextUsername('Johnny Paratext');
      env.fixture.detectChanges();
      expect(env.unlinkParatextButton.nativeElement.textContent).toContain('Remove link');
      env.clickButton(env.unlinkParatextButton);
      verify(env.mockedSFUserService.onlineUnlinkParatextAccount()).once();
      expect(env.paratextLinkLabel).toBeNull();
      expect(env.connectParatextButton.nativeElement.textContent).toContain('Connect to Paratext');
    }));

    // TODO: Add tests for linked google account
  });

  describe('delete account', () => {
    it('should have a title and a delete account button', fakeAsync(() => {
      expect(env.deleteAccountElement.nativeElement.querySelector('mat-card mat-card-title').textContent).toBe(
        'Delete account'
      );
      expect(env.deleteAccountElement.nativeElement.querySelector('mat-card mat-card-subtitle').textContent).toContain(
        env.userInDatabase.name
      );
    }));

    it('should bring up a dialog if button is clicked', fakeAsync(() => {
      expect(env.deleteAccountButton.nativeElement.textContent).toContain('Delete my account');
      env.clickButton(env.deleteAccountButton);
      verify(env.mockedMatDialog.open(anything(), anything())).once();
    }));
  });
});

/**
 * Verify states of controls associated with a specifc datum.
 * Controls using an Update button can make use of updateButtonEnabled and arrow. */
function verifyStates(
  env: TestEnvironment,
  controlName: string,
  expected: {
    state: any;
    updateButtonEnabled?: boolean;
    arrow?: boolean;
    spinner: boolean;
    greenCheck: boolean;
    errorIcon: boolean;
    inputEnabled: boolean;
  },
  updateButton?: any
) {
  expect(env.component.controlStates.get(controlName)).toBe(expected.state);
  expect(env.spinner(controlName) !== null).toBe(expected.spinner);
  expect(env.greenCheck(controlName) !== null).toBe(expected.greenCheck);
  expect(env.errorIcon(controlName) !== null).toBe(expected.errorIcon);
  expect(env.component.formGroup.get(controlName).enabled).toBe(expected.inputEnabled);

  if (expected.updateButtonEnabled !== undefined) {
    expect(updateButton.disabled).not.toBe(expected.updateButtonEnabled);
  }

  if (expected.arrow !== undefined) {
    expect(env.buttonIcon(controlName) !== null).toBe(expected.arrow);
  }
}
