import { DebugElement } from '@angular/core';
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { RecordIdentity } from '@orbit/data';
import { Observer, of } from 'rxjs';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';

import { QueryResults } from '@xforge-common/json-api.service';
import { Resource } from '@xforge-common/models/resource';
import { User } from '@xforge-common/models/user';
import { NoticeService } from '@xforge-common/notice.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { UserService } from '@xforge-common/user.service';
import { SFUser } from '../core/models/sfuser';
import { SFUserService } from '../core/sfuser.service';
import { ChangingUsernameDialogComponent } from './changing-username-dialog/changing-username-dialog.component';
import { MyAccountComponent } from './my-account.component';

class StubQueryResults<T> implements QueryResults<T> {
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
  // ShowOnDirtyErrorStateMatcher helps form errors show up during unit testing.
  providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
  entryComponents: [MyAccountComponent, ChangingUsernameDialogComponent]
})
class TestModule {}

class TestEnvironment {
  userInDatabase: SFUser = new SFUser({
    name: 'bob smith',
    username: 'bobusername',
    email: 'bob@example.com',
    contactMethod: 'email'
  });

  userInDatabaseObserver: Observer<QueryResults<User>>;

  component: MyAccountComponent;
  fixture: ComponentFixture<MyAccountComponent>;

  mockedSFUserService: SFUserService;
  mockedMatDialog: MatDialog;
  mockedMatDialogRefForCUDC: MatDialogRef<ChangingUsernameDialogComponent>;
  mockedNoticeService: NoticeService;

  constructor() {
    this.mockedSFUserService = mock(SFUserService);
    this.mockedMatDialog = mock(MatDialog);
    this.mockedMatDialogRefForCUDC = mock(MatDialogRef);
    this.mockedNoticeService = mock(NoticeService);

    when(this.mockedSFUserService.getUser()).thenReturn(of(new StubQueryResults(this.userInDatabase)));
    when(this.mockedSFUserService.currentUserId).thenReturn('user01');

    when(this.mockedMatDialogRefForCUDC.afterClosed()).thenReturn(of('update'));
    when(this.mockedMatDialog.open(anything(), anything())).thenReturn(instance(this.mockedMatDialogRefForCUDC));

    when(this.mockedNoticeService.push(anything(), anything())).thenReturn('aa');

    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedSFUserService) },
        { provide: MatDialog, useFactory: () => instance(this.mockedMatDialog) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) }
      ],
      declarations: []
    }).compileComponents();

    this.fixture = TestBed.createComponent(MyAccountComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }

  clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
  }

  buttonIcon(controlName: string): DebugElement {
    return this.fixture.debugElement.query(By.css(`#${controlName}-button-icon`));
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

  get contactMethodSmsToggle(): DebugElement {
    return this.fixture.debugElement.query(By.css('mat-button-toggle[value="sms"]'));
  }

  get matErrors(): Array<DebugElement> {
    return this.fixture.debugElement.queryAll(By.css('mat-error'));
  }

  get header2(): HTMLElement {
    return this.fixture.nativeElement.querySelector('h2');
  }
}

describe('MyAccountComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('should have a relevant title', () => {
    const title = env.fixture.debugElement.componentInstance.title;
    expect(title).toEqual('Account details - Scripture Forge');
    const header = env.header2.textContent;
    expect(header).toEqual('Account details');
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

    env.clickButton(env.contactMethodSmsToggle);
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
