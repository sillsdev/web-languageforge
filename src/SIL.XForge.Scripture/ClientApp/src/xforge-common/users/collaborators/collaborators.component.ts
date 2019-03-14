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

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent extends SubscriptionDisposable implements OnInit {
  @ViewChild('inviteError') inviteError: MdcMenu;
  @ViewChild('userSearch') userMenu: MdcMenu;
  emailPattern = '[a-zA-Z0-9.-_]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}';
  pageIndex: number = 0;
  pageSize: number = 50;
  users: User[];
  userSelectionForm = new FormGroup({
    user: new FormControl('')
  });
  userInviteForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(this.emailPattern)])
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

  addDisabled(): boolean {
    return !(this.userSelectionForm.value.user && this.isUserSelected);
  }

  emailExists(): boolean {
    if (this.users) {
      const email: string = this.userInviteForm.value.email;
      for (const user of this.users) {
        if (user.canonicalEmail === email.toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }

  inviteDisabled(): boolean {
    return this.emailExists() || this.userInviteForm.invalid;
  }

  noUserFound(): boolean {
    if (this.users) {
      return false;
    }
    return true;
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
    if (this.emailExists()) {
      this.inviteError.open = true;
    }
  }

  updateSearchTerms(term: string): void {
    this.searchTerm$.next(term);
    if (this.users && term.length > 2) {
      this.userMenu.open = true;
    }
  }

  userSelected(event: { index: number; item: MdcListItem }) {
    this.userSelectionForm.controls.user.setValue(this.users[event.index].canonicalEmail);
    this.isUserSelected = true;
  }
}
