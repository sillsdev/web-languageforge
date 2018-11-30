import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

import { IdentityService } from '@identity/identity.service';
import { NoticeService } from '@xforge-common/notice.service';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss']
})
export class InviteDialogComponent {
  sendInviteForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  isSubmitted: boolean = false;
  siteName = environment.siteName;

  constructor(
    private readonly dialogRef: MatDialogRef<InviteDialogComponent>,
    private readonly noticeService: NoticeService,
    private readonly identityService: IdentityService
  ) {}

  get email() {
    return this.sendInviteForm.get('email');
  }

  onSubmit() {
    if (!this.sendInviteForm.valid) {
      return false;
    }

    this.isSubmitted = true;
    this.identityService.sendInvite(this.sendInviteForm.value.email).then(response => {
      let message: string = '';
      this.isSubmitted = false;
      if (response.success) {
        if (response.emailTypeSent === 'joined') {
          message = 'An email has been sent to ' + this.sendInviteForm.value.email + ' adding them to this project';
          this.noticeService.push(NoticeService.SUCCESS, message);
          this.sendInviteForm.reset();
        } else if (response.emailTypeSent === 'invited') {
          message = 'An invitation email has been sent to ' + this.sendInviteForm.value.email;
          this.noticeService.push(NoticeService.SUCCESS, message);
          this.sendInviteForm.reset();
        } else if (response.isAlreadyInProject) {
          message = 'A user with email ' + this.sendInviteForm.value.email + ' is already in the project';
          this.noticeService.push(NoticeService.SUCCESS, message);
        }
      }
    });
  }

  onClose() {
    this.sendInviteForm.reset();
    this.dialogRef.close();
  }
}
