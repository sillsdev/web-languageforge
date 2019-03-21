import { MdcListItem, MdcMenu, MdcTextField } from '@angular-mdc/web';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { GetAllParameters } from '../../json-api.service';
import { Project } from '../../models/project';
import { ProjectUser } from '../../models/project-user';
import { User, UserRef } from '../../models/user';
import { NoticeService } from '../../notice.service';
import { InviteAction, ProjectService } from '../../project.service';
import { SubscriptionDisposable } from '../../subscription-disposable';
import { UserService } from '../../user.service';
import { nameof } from '../../utils';
import { XFValidators } from '../../xfvalidators';

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent extends SubscriptionDisposable implements OnInit {
  @ViewChild('userSearch') userMenu: MdcMenu;
  @ViewChild('userAddInput') addUserInput: MdcTextField;
  pageIndex: number = 0;
  pageSize: number = 50;
  users: User[];
  usersInProject: UserRef[] = [];
  userSelectionForm = new FormGroup({
    user: new FormControl('')
  });
  userInviteForm = new FormGroup(
    {
      email: new FormControl('', [XFValidators.email])
    },
    this.checkUserDoesNotExist()
  );

  private addButtonClicked = false;
  private inviteButtonClicked = false;
  private isUserSelected = false;
  private searchTerm$ = new BehaviorSubject<string>('');
  private parameters$ = new BehaviorSubject<GetAllParameters<User>>(this.getParameters());
  private reload$ = new BehaviorSubject<void>(null);

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly noticeService: NoticeService
  ) {
    super();
  }

  get addDisabled(): boolean {
    return !(this.userSelectionForm.value.user && this.isUserSelected) || this.addButtonClicked;
  }

  get inviteDisabled(): boolean {
    return (
      this.emailExists || this.userInviteForm.invalid || !this.userInviteForm.value.email || this.inviteButtonClicked
    );
  }

  get usersFound(): boolean {
    return this.users != null && this.users.length > 0;
  }

  private get emailExists(): boolean {
    if (this.usersFound) {
      const email: string = this.userInviteForm.value.email ? this.userInviteForm.value.email : '';
      const existingUser = this.users.find(user => user.canonicalEmail === email.toLowerCase());
      return existingUser != null;
    }
    return false;
  }

  ngOnInit() {
    this.subscribe(
      this.activatedRoute.params.pipe(
        switchMap(params => this.projectService.get(params['projectId'], [[nameof<Project>('users')]]))
      ),
      project => {
        const projectUsers = project.getManyIncluded<ProjectUser>(project.data.users);
        for (const pu of projectUsers) {
          this.usersInProject.push(pu.user);
        }
      }
    );
    this.subscribe(this.userService.onlineSearch(this.searchTerm$, this.parameters$, this.reload$), users => {
      this.users = users.data;
    });
  }

  isUserInProject(user: User): boolean {
    return this.usersInProject.findIndex(u => u.id === user.id) > -1;
  }

  async onAdd(): Promise<void> {
    this.addButtonClicked = true;
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
    this.addButtonClicked = false;
    this.isUserSelected = false;
  }

  async onInvite(): Promise<void> {
    this.inviteButtonClicked = true;
    const email = this.userInviteForm.value.email;
    const action = await this.projectService.onlineInvite(email);
    if (action === InviteAction.Invited) {
      const message = 'An invitation email has been sent to ' + this.userInviteForm.value.email + '.';
      this.noticeService.show(message);
    } else {
      this.noticeService.show('Unable to invite the user to this project.');
    }
    this.userInviteForm.reset();
    this.inviteButtonClicked = false;
  }

  refocusInput(): void {
    // Return focus back to the text input when the user menu opens and the text input loses focus
    if (this.userMenu.open) {
      this.addUserInput.focus();
    }
  }

  searchForExistingEmail(term: string): void {
    this.searchTerm$.next(term);
  }

  updateSearchTerms(term: string): void {
    this.searchTerm$.next(term);
    if (this.usersFound && this.users.length <= 10 && term.length > 2) {
      if (!this.userMenu.open) {
        this.userMenu.open = true;
      }
    } else {
      this.userMenu.open = false;
    }
  }

  userSelected(event: { index: number; source: MdcListItem }) {
    this.userSelectionForm.controls.user.setValue(event.source.value as string);
    this.isUserSelected = true;
  }

  private checkUserDoesNotExist(): ValidatorFn {
    return (): { [key: string]: any } | null => {
      return this.emailExists ? { 'invite-disallowed': true } : null;
    };
  }

  private getParameters(): GetAllParameters<User> {
    return { sort: [{ name: 'name', order: 'ascending' }] };
  }
}
