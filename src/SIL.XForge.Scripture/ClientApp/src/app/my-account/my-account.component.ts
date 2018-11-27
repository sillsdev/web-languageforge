import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog, NativeDateAdapter } from '@angular/material';
import { Title } from '@angular/platform-browser';

import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { environment } from 'src/environments/environment';
import { UserService } from '../../xforge-common/user.service';
import { SFUser } from '../core/models/sfuser';
import { ChangingUsernameDialogComponent } from './changing-username-dialog/changing-username-dialog.component';

/** Support ISO8601 formatted dates for datepicker, and handle timezone issues. */
class ISO8601DateAdapter extends NativeDateAdapter {
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
 * State of element in component, such as whether the email address is
 * being submitted, or was submitted succesfully.
 */
enum ElementState {
  /** Identical to what is believed to be in the database. */
  InSync = 'InSync',
  /** Different than what is believed to be in the database.
   *  Not to be confused with an input control claiming to be 'dirty', which might still actually be InSync. */
  Dirty = 'Dirty',
  /** Pending a write to the database. */
  Submitting = 'Submitting',
  /** InSync and was written to the database since last Dirty. */
  Submitted = 'Submitted'
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
    username: new FormControl(),
    email: new FormControl(),
    mobilePhone: new FormControl(),
    contactMethod: new FormControl(),
    birthday: new FormControl(),
    gender: new FormControl()
  });

  /** User data as received from the database. */
  userFromDatabase: SFUser;

  private title = `Account details - ${environment.siteName}`;
  private doneInitialDatabaseImport: boolean = false;

  constructor(private userService: UserService, public dialog: MatDialog, private titleService: Title) {
    super();
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.subscribe(this.userService.getUser(), user => {
      this.userFromDatabase = user.results;
      if (user.results == null) {
        // The first time a user uses this page, the first subscribe
        // notification has a null .results. Just skip that one.
        return;
      }

      if (this.doneInitialDatabaseImport) {
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

      this.doneInitialDatabaseImport = true;
    });

    // Update states when control values change.
    for (const element of Object.keys(this.formGroup.controls)) {
      this.subscribe(this.formGroup.get(element).valueChanges, () => {
        const isClean = this.userFromDatabase[element] === this.formGroup.get(element).value;
        const newState = isClean ? ElementState.InSync : ElementState.Dirty;
        this.controlStates.set(element, newState);
      });
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    // Set title back, until titling is done more elegantly,
    // like https://toddmotto.com/dynamic-page-titles-angular-2-router-events
    this.titleService.setTitle(environment.siteName);
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

  update(element: string): void {
    const updatedAttributes: Partial<SFUser> = {};
    updatedAttributes[element] = this.formGroup.controls[element].value;

    this.controlStates.set(element, ElementState.Submitting);

    this.userService
      .updateUserAttributes(updatedAttributes)
      .then(success => {
        this.controlStates.set(element, ElementState.Submitted);
      })
      .catch(failure => {
        // TODO handle
      });
  }
}
