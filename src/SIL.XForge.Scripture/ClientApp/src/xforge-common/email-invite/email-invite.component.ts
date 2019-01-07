import { MdcDialog, MdcDialogConfig } from '@angular-mdc/web';
import { Component } from '@angular/core';

import { InviteDialogComponent } from './invite-dialog.component';

@Component({
  selector: 'app-email-invite',
  templateUrl: './email-invite.component.html',
  styleUrls: ['./email-invite.component.scss']
})
export class EmailInviteComponent {
  constructor(private dialog: MdcDialog) {}

  openDialog() {
    const dialogConfig = {
      clickOutsideToClose: false
    } as MdcDialogConfig;
    this.dialog.open(InviteDialogComponent, dialogConfig);
  }
}
