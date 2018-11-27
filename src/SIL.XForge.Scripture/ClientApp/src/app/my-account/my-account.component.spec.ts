import { DebugElement } from '@angular/core';
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';

import { RecordIdentity } from '@orbit/data';
import { Resource } from '@xforge-common/models/resource';
import { User } from '@xforge-common/models/user';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { QueryResults } from '../../xforge-common/json-api.service';
import { UserService } from '../../xforge-common/user.service';
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
  providers: [],
  entryComponents: [MyAccountComponent, ChangingUsernameDialogComponent]
})
class TestModule {}

class TestEnvironment {
  component: MyAccountComponent;
  fixture: ComponentFixture<MyAccountComponent>;

  mockedSFUserService: SFUserService;
  mockedMatDialog: MatDialog;
  mockedMatDialogRefForCUDC: MatDialogRef<ChangingUsernameDialogComponent>;

  userInDatabase: SFUser = new SFUser({
    name: 'bob smith',
    username: 'bobusername',
    email: 'bob@example.com'
  });

  constructor() {
    this.mockedSFUserService = mock(SFUserService);
    this.mockedMatDialog = mock(MatDialog);
    this.mockedMatDialogRefForCUDC = mock(MatDialogRef);

    when(this.mockedSFUserService.getUser()).thenReturn(of(new StubQueryResults(this.userInDatabase)));
    when(this.mockedSFUserService.currentUserId).thenReturn('user01');

    when(this.mockedMatDialogRefForCUDC.afterClosed()).thenReturn(of('update'));
    when(this.mockedMatDialog.open(anything(), anything())).thenReturn(instance(this.mockedMatDialogRefForCUDC));

    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedSFUserService) },
        { provide: MatDialog, useFactory: () => instance(this.mockedMatDialog) }
      ],
      declarations: []
    }).compileComponents();

    this.fixture = TestBed.createComponent(MyAccountComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }

  public clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
  }

  get nameUpdateButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#name-update-button'));
  }

  get nameButtonIcon(): DebugElement {
    return this.fixture.debugElement.query(By.css('#name-button-icon'));
  }

  get nameUpdateSpinner(): DebugElement {
    return this.fixture.debugElement.query(By.css('#name-update-spinner'));
  }

  get nameUpdateDone(): DebugElement {
    return this.fixture.debugElement.query(By.css('#name-update-done'));
  }

  get usernameUpdateButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#username-update-button'));
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
    const header = env.fixture.nativeElement.querySelector('h2').textContent;
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
    const updateButton = env.nameUpdateButton.nativeElement;
    expect(env.component.formGroup.get('name').value).toEqual(originalName, 'test setup problem');

    verifyControlDecorations(
      env,
      'name',
      /* expected state */ env.component.elementState.InSync,
      updateButton,
      /* button enabled */ false,
      /* arrow */ true,
      /* spinner */ false,
      /* green check */ false
    );

    // change name on page
    const newName = 'robert';
    expect(originalName).not.toBe(newName, 'test set up wrong');
    env.component.formGroup.get('name').setValue(newName);
    env.fixture.detectChanges();

    verifyControlDecorations(
      env,
      'name',
      /* expected state */ env.component.elementState.Dirty,
      updateButton,
      /* button enabled */ true,
      /* arrow */ true,
      /* spinner */ false,
      /* green check */ false
    );

    // click update
    env.clickButton(env.nameUpdateButton);

    verifyControlDecorations(
      env,
      'name',
      /* expected state */ env.component.elementState.Submitting,
      updateButton,
      /* button enabled */ false,
      /* arrow */ false,
      /* spinner */ true,
      /* green check */ false
    );

    // The spinner shows during networking. Time passes. Finish networking with flush()
    // before checking that the spinner is gone.
    flush();
    env.fixture.detectChanges();

    verifyControlDecorations(
      env,
      'name',
      /* expected state */ env.component.elementState.Submitted,
      updateButton,
      /* button enabled */ false,
      /* arrow */ false,
      /* spinner */ false,
      /* green check */ true
    );

    // We don't need to test the fake database, but this failing is an early indication
    // of what may be about to go wrong.
    expect(env.component.userFromDatabase.name).toBe(newName);

    // modify text
    const newerName = 'Bobby';
    env.component.formGroup.get('name').setValue(newerName);
    env.fixture.detectChanges();

    verifyControlDecorations(
      env,
      'name',
      /* expected state */ env.component.elementState.Dirty,
      updateButton,
      /* button enabled */ true,
      /* arrow */ true,
      /* spinner */ false,
      /* green check */ false
    );

    // Modify text back to what it is in the database. In other words, manually editing
    // it back to a 'clean state'.
    env.component.formGroup.get('name').setValue(newName);
    env.fixture.detectChanges();

    verifyControlDecorations(
      env,
      'name',
      /* expected state */ env.component.elementState.InSync,
      updateButton,
      /* button enabled */ false,
      /* arrow */ true,
      /* spinner */ false,
      /* green check */ false
    );
  }));

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
      env.clickButton(env.usernameUpdateButton);

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

function verifyControlDecorations(
  env: TestEnvironment,
  controlName: string,
  expectedState: any,
  updateButton: any,
  expectedUpdateButtonEnabled: boolean,
  expectedArrow: boolean,
  expectedSpinner: boolean,
  expectedGreenCheck: boolean
) {
  expect(env.component.controlStates.get(controlName)).toBe(expectedState);
  expect(updateButton.disabled).not.toBe(expectedUpdateButtonEnabled);
  expect(env.nameButtonIcon !== null).toBe(expectedArrow);
  expect(env.nameUpdateSpinner !== null).toBe(expectedSpinner);
  expect(env.nameUpdateDone !== null).toBe(expectedGreenCheck);
}
