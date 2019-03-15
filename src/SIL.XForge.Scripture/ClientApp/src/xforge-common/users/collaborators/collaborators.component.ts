import { MdcListItem, MdcMenu } from '@angular-mdc/web';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { GetAllParameters } from '../../json-api.service';
import { User } from '../../models/user';
import { NoticeService } from '../../notice.service';
import { InviteAction, ProjectService } from '../../project.service';
import { SubscriptionDisposable } from '../../subscription-disposable';
import { UserService } from '../../user.service';
import { XFValidators } from '../../xfvalidators';

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent extends SubscriptionDisposable implements OnInit {
  @ViewChild('inviteError') inviteError: MdcMenu;
  @ViewChild('userSearch') userMenu: MdcMenu;
  pageIndex: number = 0;
  pageSize: number = 50;
  users: User[];
  userSelectionForm = new FormGroup({
    user: new FormControl('')
  });
  userInviteForm = new FormGroup({
    email: new FormControl('', [Validators.required, XFValidators.email])
  });

  private isUserSelected = false;
  private searchTerm$ = new BehaviorSubject<string>('');
  private parameters$ = new BehaviorSubject<GetAllParameters<User>>({});
  private reload$ = new BehaviorSubject<void>(null);

  constructor(
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly noticeService: NoticeService
  ) {
    super();
  }

  ngOnInit() {
    this.subscribe(
      this.userService.onlineSearch(this.searchTerm$, this.parameters$, this.reload$),
      users => (this.users = users.data)
    );
  }

  get addDisabled(): boolean {
    return !(this.userSelectionForm.value.user && this.isUserSelected);
  }

  get inviteDisabled(): boolean {
    return this.emailExists || this.userInviteForm.invalid;
  }

  get usersFound(): boolean {
    return this.users != null && this.users.length > 0;
  }

  private get emailExists(): boolean {
    if (this.usersFound) {
      const email: string = this.userInviteForm.value.email;
      const existingUser = this.users.find(user => user.canonicalEmail === email.toLowerCase());
      return existingUser != null;
    }
    return false;
  }

  async onAdd(): Promise<void> {
    const email = this.userSelectionForm.value.user;
    const action = await this.projectService.onlineInvite(email);
    if (action === InviteAction.Joined) {
      const message =
        'An email has been sent to ' + this.userSelectionForm.value.user + ' adding them to this project.';
      this.noticeService.show(message);
    } else {
      this.noticeService.show('Unable to add the user to this project.');
    }
    this.userSelectionForm.reset();
    this.isUserSelected = false;
  }

  async onInvite(): Promise<void> {
    const email = this.userInviteForm.value.email;
    const action = await this.projectService.onlineInvite(email);
    if (action === InviteAction.Invited) {
      const message = 'An invitation email has been sent to ' + this.userInviteForm.value.email + '.';
      this.noticeService.show(message);
    } else {
      this.noticeService.show('Unable to invite the user to this project.');
    }
    this.userInviteForm.reset();
  }

  searchForExistingEmail(term: string): void {
    this.searchTerm$.next(term);
    if (this.emailExists) {
      this.inviteError.open = true;
    }
  }

  updateSearchTerms(term: string): void {
    this.searchTerm$.next(term);
    if (this.usersFound && term.length > 2) {
      if (this.users.length <= 10) {
        // The text field loses focus when the menu appears. Display when 10 items or less match
        this.userMenu.open = true;
      }
    }
  }

  userSelected(event: { index: number; item: MdcListItem }) {
    this.userSelectionForm.controls.user.setValue(this.users[event.index].email);
    this.isUserSelected = true;
  }
}
