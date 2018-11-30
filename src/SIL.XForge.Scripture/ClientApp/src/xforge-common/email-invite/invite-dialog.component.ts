import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

import { environment } from '../../environments/environment';
import { NoticeService } from '../notice.service';
import { InviteAction, ProjectService } from '../project.service';

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
    private readonly projectService: ProjectService
  ) {}

  get email() {
    return this.sendInviteForm.get('email');
  }

  async onSubmit(): Promise<void> {
    if (!this.sendInviteForm.valid) {
      return;
    }

    this.isSubmitted = true;
    const actionPerformed = await this.projectService.onlineInvite(this.sendInviteForm.value.email);
    let message: string = '';
    this.isSubmitted = false;
    switch (actionPerformed) {
      case InviteAction.Joined:
        message = 'An email has been sent to ' + this.sendInviteForm.value.email + ' adding them to this project';
        this.noticeService.push(NoticeService.SUCCESS, message);
        this.sendInviteForm.reset();
        break;

      case InviteAction.Invited:
        message = 'An invitation email has been sent to ' + this.sendInviteForm.value.email;
        this.noticeService.push(NoticeService.SUCCESS, message);
        this.sendInviteForm.reset();
        break;

      case InviteAction.None:
        message = 'A user with email ' + this.sendInviteForm.value.email + ' is already in the project';
        this.noticeService.push(NoticeService.SUCCESS, message);
        break;
    }
  }

  onClose() {
    this.sendInviteForm.reset();
    this.dialogRef.close();
  }
}
