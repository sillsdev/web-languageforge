import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NgModule } from '@angular/core';
import { fakeAsync, flush } from '@angular/core/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorStateMatcher, MatDialog, MatDialogRef, ShowOnDirtyErrorStateMatcher } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { merge } from '@orbit/utils';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { ngfModule } from 'angular-file';
import { AuthService } from '../auth.service';
import { Site } from '../models/site';
import { User } from '../models/user';
import { NoticeService } from '../notice.service';
import { ParatextService } from '../paratext.service';
import { UICommonModule } from '../ui-common.module';
import { UserService } from '../user.service';
import { DeleteAccountDialogComponent } from './delete-account-dialog/delete-account-dialog.component';
import { MyAccountComponent } from './my-account.component';

describe('MyAccountComponent', () => {
  let env: TestEnvironment;
  const date = new Date(Date.now());
  date.setDate(date.getDate() - 1);
  beforeEach(() => {
    env = new TestEnvironment(
      new User({
        name: 'bob smith',
        username: 'bobusername',
        email: 'bob@example.com',
        contactMethod: 'email',
        mobilePhone: '+123 11 2222-33-4444',
        site: { currentProjectId: 'testproject01', lastLogin: date } as Site
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

  it('should display last login date', () => {
    expect(env.lastLogin.textContent).toContain('Last login 1 day ago');
  });

  // This tests that various UI icons etc are shown or not shown,
  // as data is edited and submitted, such as
  // the update button being disabled, the green check icon,
  // arrow icon, and spinner.
  // The test goes thru a sequence of actions, verifying state and icons.
  it('should update spinner, arrow, check, and disabled, depending on activity', fakeAsync(() => {
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
    when(env.mockedUserService.onlineUpdateCurrentUserAttributes(anything())).thenReject({ stack: technicalDetails });

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
  }));

  // TODO SF-178: include this test after SMS notification is implemented
  xit('handles network error for toggle buttons', fakeAsync(() => {
    const technicalDetails = 'squirrel chewed thru line. smoke lost.';
    when(env.mockedUserService.onlineUpdateCurrentUserAttributes(anything())).thenReject({ stack: technicalDetails });

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
    it('error if email address removed', fakeAsync(() => {
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
      expect(env.component.formGroup.controls['email'].hasError('required')).toBe(true);
      expect(env.matErrors.length).toEqual(1);
      expect((env.matErrors[0].nativeElement as HTMLElement).innerText).toContain('must supply a valid email');
    }));

    describe('validate email pattern', () => {
      it('good email pattern means no error and enabled update button', () => {
        expectEmailPatternIsGood(env, 'bob_smith+extension@lunar-astronaut.technology');
      });

      it('bad email pattern means error message and disabled update button', () => {
        expectEmailPatternIsBad(env, 'bob smith@example.com');
      });

      xdescribe('by-hand, more extensive pattern checking', () => {
        it('no error for good email pattern', () => {
          const goodEmail1 = 'john@example.com';
          expect(env.userInDatabase.email).not.toEqual(goodEmail1, 'setup');

          expectEmailPatternIsGood(env, goodEmail1);
          expectEmailPatternIsGood(env, 'bob.james.smith.smitheyson@lunar-astronaut.technology');
          expectEmailPatternIsGood(env, 'bob_smith@example.com');
          expectEmailPatternIsGood(env, 'bob+extension@example.com');
          expectEmailPatternIsGood(env, 'a@w.org');
        });

        it('error for bad email pattern', () => {
          const badEmailPatterns = [
            'bob',
            'example.com',
            '@',
            'bob@',
            '@example.com',
            'bob@example',
            'bob@.com',
            '.bob@example.com',
            'bob@.example.com',
            'bob@example.com.',
            'bob@example..com',
            'bob@example.a',
            'bob smith@example.com',
            'bob@exam ple.com',
            'bob@example.co m',
            ' bob@example.com',
            'bob @example.com',
            'bob@ example.com',
            'bob@example .com',
            'bob@example. com',
            'bob@example.com ',
            '*@example.com',
            'bob@@.com',
            'bob@!.com',
            'bob@example.&',
            'bob@example*com',
            'bob$bob@example.com',
            'bob@example$example.com',
            'bob@example.foo$foo.com',
            'bob@example.c$om'
          ];
          for (const badEmailPattern of badEmailPatterns) {
            expectEmailPatternIsBad(env, badEmailPattern);
          }
        });
      });
    });
  });

  // TODO SF-178: include this test after SMS notification is implemented
  xdescribe('contactMethod restrictions', () => {
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
      verify(env.mockedUserService.onlineUnlinkParatextAccount()).once();
      expect(env.paratextLinkLabel).toBeNull();
      expect(env.connectParatextButton.nativeElement.textContent).toContain('Connect to Paratext');
    }));

    // TODO: Add tests for linked google account
  });

  describe('delete account', () => {
    it('should have a title and a delete account button', fakeAsync(() => {
      expect(env.deleteAccountElement.nativeElement.querySelector('mat-card mat-card-title').textContent).toContain(
        'Delete my account'
      );
      expect(env.deleteAccountElement.nativeElement.querySelector('mat-card mat-card-title').textContent).toContain(
        env.userInDatabase.name
      );
    }));

    it('should bring up a dialog if button is clicked', fakeAsync(() => {
      when(env.mockedMatDialogRefForDAD.afterClosed()).thenReturn(of('confirmed'));
      when(env.mockedMatDialog.open(anything(), anything())).thenReturn(instance(env.mockedMatDialogRefForDAD));
      expect(env.deleteAccountButton.nativeElement.textContent).toContain('Delete my account');
      env.clickButton(env.deleteAccountButton);
      verify(env.mockedMatDialog.open(anything(), anything())).once();
    }));

    it('should delete account if requested', fakeAsync(() => {
      when(env.mockedMatDialogRefForDAD.afterClosed()).thenReturn(of('confirmed'));
      when(env.mockedMatDialog.open(anything(), anything())).thenReturn(instance(env.mockedMatDialogRefForDAD));
      env.clickButton(env.deleteAccountButton);
      verify(env.mockedMatDialog.open(anything(), anything())).once();
      verify(env.mockedUserService.onlineDelete(anything())).once();
      expect().nothing();
    }));

    it('should not delete account if cancelled', fakeAsync(() => {
      when(env.mockedMatDialogRefForDAD.afterClosed()).thenReturn(of('cancel'));
      when(env.mockedMatDialog.open(anything(), anything())).thenReturn(instance(env.mockedMatDialogRefForDAD));
      env.clickButton(env.deleteAccountButton);
      verify(env.mockedMatDialog.open(anything(), anything())).once();
      verify(env.mockedUserService.onlineDelete(anything())).never();
      expect().nothing();
    }));
  });
});

@NgModule({
  declarations: [MyAccountComponent],
  imports: [NoopAnimationsModule, ngfModule, RouterTestingModule, UICommonModule],
  exports: [MyAccountComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ShowOnDirtyErrorStateMatcher helps form errors show up during unit testing.
  providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
  entryComponents: [MyAccountComponent]
})
class TestModule {}

class TestEnvironment {
  component: MyAccountComponent;
  fixture: ComponentFixture<MyAccountComponent>;

  mockedUserService: UserService;
  mockedParatextService: ParatextService;
  mockedMatDialog: MatDialog;
  mockedMatDialogRefForDAD: MatDialogRef<DeleteAccountDialogComponent>;
  mockedNoticeService: NoticeService;
  mockedAuthService: AuthService;

  private substituteParatextUsername: string;

  constructor(public userInDatabase: User) {
    this.mockedUserService = mock(UserService);
    this.mockedParatextService = mock(ParatextService);
    this.mockedMatDialog = mock(MatDialog);
    this.mockedMatDialogRefForDAD = mock(MatDialogRef);
    this.mockedNoticeService = mock(NoticeService);
    this.mockedAuthService = mock(AuthService);

    when(this.mockedUserService.getCurrentUser()).thenReturn(of(this.userInDatabase));
    when(this.mockedUserService.currentUserId).thenReturn('user01');
    when(this.mockedParatextService.getParatextUsername()).thenReturn(of(this.substituteParatextUsername));
    when(this.mockedUserService.onlineUnlinkParatextAccount()).thenCall(() => {
      this.setParatextUsername(null);
      return Promise.resolve();
    });
    when(this.mockedUserService.onlineUpdateCurrentUserAttributes(anything())).thenCall(
      this.mockUserServiceUpdateUserAttributes()
    );
    when(this.mockedNoticeService.show(anything())).thenResolve();

    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
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
          merge(this.userInDatabase, updatedAttributes);
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

  get lastLogin(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#last-login');
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

function expectEmailPatternIsBad(env: TestEnvironment, badEmail: string) {
  env.component.formGroup.get('email').setValue(badEmail);
  env.component.formGroup.get('email').markAsDirty();
  env.fixture.detectChanges();
  // Using .toBe() so the bad email prints in failure output
  expect(env.matErrors.length).toBe(1, badEmail);
  expect((env.matErrors[0].nativeElement as HTMLElement).innerText).toContain('valid email address');
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
}

function expectEmailPatternIsGood(env: TestEnvironment, goodEmail: string) {
  env.component.formGroup.get('email').setValue(goodEmail);
  env.component.formGroup.get('email').markAsDirty();
  env.fixture.detectChanges();
  expect(env.matErrors.length).toEqual(0);
  verifyStates(
    env,
    'email',
    {
      state: env.component.elementState.Dirty,
      updateButtonEnabled: true,
      arrow: true,
      spinner: false,
      greenCheck: false,
      errorIcon: false,
      inputEnabled: true
    },
    env.updateButton('email').nativeElement
  );
}

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
