import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';

import { AuthService } from '@xforge-common/auth.service';
import { NoticeService } from '@xforge-common/notice.service';
import { UserService } from '@xforge-common/user.service';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-email-invite',
  templateUrl: './email-invite.component.html',
  styleUrls: ['./email-invite.component.scss']
})
export class EmailInviteComponent implements OnInit {
  sendInviteForm: FormGroup;
  isSubmitted: boolean = false;
  showInviteForm: boolean = true;
  spinnerDisplay: boolean = false;
  disabledSendInviteBtn: boolean = false;
  siteName = environment.siteName;

  constructor(private dialog: MatDialog, private readonly formBuilder: FormBuilder,
    private readonly noticeService: NoticeService, private readonly authService: AuthService,
    private readonly userService: UserService) { }

  ngOnInit() {
    this.sendInviteForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
    });
  }

  get formControls() {
    return this.sendInviteForm.controls;
  }

  get name() {
    return this.authService.currentUserName;
  }

  openDialog(dialogRef: any) {
    this.dialog.open(dialogRef, { disableClose: true });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.sendInviteForm.valid) {
      this.spinnerDisplay = true;
      this.disabledSendInviteBtn = true;
      this.userService.sendInvitation(this.name, this.sendInviteForm.value.email)
        .subscribe(response => {
          if (response === 'User already has an account!') {
            this.isSubmitted = false;
            this.spinnerDisplay = false;
            this.disabledSendInviteBtn = false;
            this.noticeService.push(NoticeService.SUCCESS, response);
          } else {
            this.isSubmitted = false;
            this.dialog.closeAll();
            this.spinnerDisplay = false;
            this.disabledSendInviteBtn = false;
            this.noticeService.push(NoticeService.SUCCESS, response);
            this.sendInviteForm.reset();
          }
        });
    } else {
      return false;
    }
  }

  onCancel() {
    this.sendInviteForm.reset();
    this.dialog.closeAll();
  }
}
