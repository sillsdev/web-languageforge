import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DateAdapter, MatDialog, MatDialogRef, NativeDateAdapter } from '@angular/material';
import { Title } from '@angular/platform-browser';

import { AuthService } from 'xforge-common/auth.service';
import { ElementState } from 'xforge-common/models/element-state';
import { User } from 'xforge-common/models/user';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { XFValidators } from 'xforge-common/xfvalidators';
import { environment } from '../../environments/environment';
import { NoticeService } from '../../xforge-common/notice.service';
import { ParatextService } from '../core/paratext.service';
import { ChangingUsernameDialogComponent } from './changing-username-dialog/changing-username-dialog.component';
import { DeleteAccountDialogComponent } from './delete-account-dialog/delete-account-dialog.component';

/** Support ISO8601 formatted dates for datepicker, and handle timezone issues. */
export class ISO8601DateAdapter extends NativeDateAdapter {
  /** Return date in ISO 8601 YYYY-mm-DD format. */
  format(date: Date, displayFormat: Object): string {
    // Cut off 'T00:00:00.000Z' from the end of the string.
    return date.toISOString().split('T')[0];
  }

  // Return date information in UTC rather than local time, to make calendar
  // pop-up not sometimes show the previous day and look incorrect.
  getFullYear(date: Date): number {
    return date.getUTCFullYear();
  }
  getMonth(date: Date): number {
    return date.getUTCMonth();
  }
  getDate(date: Date): number {
    return date.getUTCDate();
  }
}

/**
 * The My Account page lets users edit their account information.
 */
@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
  providers: [{ provide: DateAdapter, useClass: ISO8601DateAdapter }]
})
export class MyAccountComponent extends SubscriptionDisposable implements OnInit, OnDestroy {
  // Make enum available to template (see https://github.com/angular/angular/issues/2885 )
  elementState = ElementState;

  /** Elements in this component and their states. */
  controlStates = new Map<string, ElementState>();

  formGroup = new FormGroup({
    name: new FormControl(),
    username: new FormControl('', [(inputControl: FormControl) => this.emailAndUsernameValidator(this, inputControl)]),
    email: new FormControl('', [
      (inputControl: FormControl) => this.emailAndUsernameValidator(this, inputControl),
      XFValidators.email
    ]),
    mobilePhone: new FormControl(),
    contactMethod: new FormControl(),
    birthday: new FormControl(),
    gender: new FormControl()
  });

  contactMethodToggleDisabled = new Map<string, boolean>([['email', false], ['sms', false], ['emailSms', false]]);
  showAvatar = true;

  /** User data as received from the database. */
  userFromDatabase: User = new User();
  paratextUsername: string;
  googleUsername: string;
  pictureFile: File;

  private readonly title = `Account details - ${environment.siteName}`;
  private doneInitialDatabaseImport: boolean = false;
  private controlsWithUpdateButton: string[] = ['name', 'username', 'email', 'mobilePhone'];
  private activeDialogRef: MatDialogRef<DeleteAccountDialogComponent>;

  constructor(
    private readonly userService: UserService,
    private readonly dialog: MatDialog,
    private readonly authService: AuthService,
    private readonly noticeService: NoticeService,
    private readonly titleService: Title,
    private readonly paratextService: ParatextService
  ) {
    super();
  }

  get userName() {
    return this.userFromDatabase.name ? this.userFromDatabase.name : 'unknown';
  }

  get isLinkedToParatext() {
    return this.paratextUsername && this.paratextUsername.length > 0;
  }

  get isLinkedToGoogle() {
    return this.googleUsername && this.googleUsername.length > 0;
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.subscribe(this.userService.getCurrentUser(), user => {
      this.userFromDatabase = user;

      this.loadLinkedAccounts();
      if (this.doneInitialDatabaseImport) {
        return;
      }

      this.reloadFromDatabase();
      this.doneInitialDatabaseImport = true;
    });

    // Update states when control values change.
    for (const controlName of Object.keys(this.formGroup.controls)) {
      this.subscribe(this.formGroup.get(controlName).valueChanges, this.onControlValueChanges(controlName));
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // Set title back, until titling is done more elegantly,
    // like https://toddmotto.com/dynamic-page-titles-angular-2-router-events
    this.titleService.setTitle(environment.siteName);
  }

  loadLinkedAccounts(): void {
    this.subscribe(
      this.paratextService.getParatextUsername(),
      ptUsername => {
        this.paratextUsername = ptUsername;
      },
      () => {
        this.noticeService.show('Got an error while loading linked accounts.');
      }
    );
    // TODO: get the username of the linked google account
  }

  // MyAccountComponent is not designed to listen to the database and dynamically update the values on the form
  // before the user's eyes. If we changed it to do that, we would need to not clobber the user's edits-in-progress
  // from the many database 'updates' that are received that aren't actual changes (such as by only updating
  // InSync fields).
  reloadFromDatabase() {
    if (this.userFromDatabase == null) {
      return;
    }

    // Set form values from database, if present.
    this.formGroup.setValue({
      name: this.userFromDatabase.name || '',
      username: this.userFromDatabase.username || '',
      email: this.userFromDatabase.email || '',
      mobilePhone: this.userFromDatabase.mobilePhone || '',
      contactMethod: this.userFromDatabase.contactMethod || null,
      birthday: this.userFromDatabase.birthday || null,
      gender: this.userFromDatabase.gender || null
    });

    // Update states.
    Object.keys(this.formGroup.controls).forEach(elementName => {
      this.controlStates.set(elementName, ElementState.InSync);
    });

    this.conformContactMethod();
  }

  updateClicked(element: string): void {
    if (element === 'username') {
      const dialogRef = this.dialog.open(ChangingUsernameDialogComponent, {
        data: {
          oldUsername: this.userFromDatabase.username,
          newUsername: this.formGroup.controls[element].value
        }
      });
      this.subscribe(dialogRef.afterClosed(), dialogResult => {
        if (dialogResult === 'update') {
          this.update(element);
        }
      });
    } else {
      this.update(element);
    }
  }

  async update(element: string): Promise<void> {
    const updatedAttributes: Partial<User> = {};
    updatedAttributes[element] = this.formGroup.controls[element].value;

    this.formGroup.get(element).disable();
    this.controlStates.set(element, ElementState.Submitting);

    if (
      element === 'mobilePhone' &&
      !this.formGroup.controls[element].value &&
      (this.userFromDatabase.contactMethod === 'sms' || this.userFromDatabase.contactMethod === 'emailSms')
    ) {
      updatedAttributes['contactMethod'] = null;
    }

    try {
      await this.userService.onlineUpdateCurrentUserAttributes(updatedAttributes);
      this.formGroup.get(element).enable();
      this.controlStates.set(element, ElementState.Submitted);
      this.conformContactMethod();
    } catch (exception) {
      // Set an input without an update button back to its previous value, so the user can try
      // again by clicking the new and desired value.
      if (!this.controlsWithUpdateButton.includes(element)) {
        this.formGroup.get(element).setValue(this.userFromDatabase[element]);
      }

      this.formGroup.get(element).enable();
      this.controlStates.set(element, ElementState.Error);
    }
  }

  /** Set contactMethod value and the disabled states of its options based on values from database. */
  conformContactMethod(): void {
    const missingPhone = !this.userFromDatabase.mobilePhone;
    const missingEmail = !this.userFromDatabase.email;
    this.contactMethodToggleDisabled.set('sms', missingPhone);
    this.contactMethodToggleDisabled.set('email', missingEmail);
    this.contactMethodToggleDisabled.set('emailSms', missingPhone || missingEmail);

    if (!this.userFromDatabase.mobilePhone) {
      this.formGroup.get('contactMethod').setValue(this.userFromDatabase.contactMethod);
    }
  }

  /**
   * Validation of username and email fields.
   *  - Email address cannot be removed once set in database.
   *  - Username cannot be blank unless email is set. Don't bother showing this error in addition to the above.
   *
   * This method takes a MyAccountComponent object, since references to 'this' end up referring to another
   * object when this method gets called.
   */
  emailAndUsernameValidator(myAccount: MyAccountComponent, control: AbstractControl): ValidationErrors {
    if (!myAccount.doneInitialDatabaseImport) {
      return null;
    }

    if (control === myAccount.formGroup.get('email')) {
      if (myAccount.userFromDatabase.email && !myAccount.formGroup.get('email').value) {
        return { emailBlank: true };
      }
    }

    if (control === myAccount.formGroup.get('username')) {
      if (myAccount.userFromDatabase.email) {
        return null;
      }
      if (!myAccount.formGroup.get('username').value) {
        return { usernameBlank: true };
      }
    }

    return null;
  }

  logInWithParatext(): void {
    this.paratextService.logIn('/my-account');
  }

  openDeleteAccountDialog(): void {
    const config = { data: { name: this.userName } };
    this.activeDialogRef = this.dialog.open(DeleteAccountDialogComponent, config);
    this.subscribe(this.activeDialogRef.afterClosed(), result => {
      if (result === 'confirmed') {
        this.onAccountDelete(this.userService.currentUserId);
      }
    });
  }

  async deleteParatextLink(): Promise<void> {
    await this.userService.onlineUnlinkParatextAccount();
    const message = 'Successfully removed the linked Paratext account.';
    this.noticeService.show(message);
    this.loadLinkedAccounts();
  }

  async deleteGoogleLink(): Promise<void> {
    /* Not Implemented */
  }

  async onAccountDelete(userId: string): Promise<void> {
    await this.userService.onlineDelete(userId);
    this.authService.logOut();
  }

  async uploadPicture(): Promise<void> {
    await this.userService.uploadCurrentUserAvatar(this.pictureFile);
  }

  private onControlValueChanges(controlName: string): () => void {
    return () => {
      const isClean = this.userFromDatabase[controlName] === this.formGroup.get(controlName).value;
      const newState = isClean ? ElementState.InSync : ElementState.Dirty;
      this.controlStates.set(controlName, newState);

      if (this.formGroup.get(controlName).errors !== null) {
        this.controlStates.set(controlName, ElementState.Invalid);
      }
    };
  }
}
