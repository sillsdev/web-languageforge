import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { OAuthService } from 'angular-oauth2-oidc';

import { NoticeService } from '@xforge-common/notice.service';
import { UserService } from '@xforge-common/user.service';
import { SFUserService } from '../core/sfuser.service';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})

export class ProjectDashboardComponent implements OnInit {
  sendInviteForm: FormGroup;
  isSubmitted: boolean = false;
  showInviteForm: boolean = true;
  spinnerDisplay: boolean = false;
  disabledSendInviteBtn: boolean = false;
  get formControls() { return this.sendInviteForm.controls; }

  constructor(private dialog: MatDialog, private readonly formBuilder: FormBuilder,
    private readonly noticeService: NoticeService, private readonly oauthService: OAuthService,
    private readonly userService: UserService, private readonly sfUserSerive: SFUserService) { }

  get name() {
    const claims = this.oauthService.getIdentityClaims();
    if (claims != null) {
      return claims['name'];
    }
    return null;
  }

  ngOnInit() {
    this.sendInviteForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
    });
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
          if (response === 'User already have an account!') {
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
