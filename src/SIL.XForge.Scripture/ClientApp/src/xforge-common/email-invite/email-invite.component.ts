import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { InviteDialogComponent } from './invite-dialog.component';

@Component({
  selector: 'app-email-invite',
  templateUrl: './email-invite.component.html',
  styleUrls: ['./email-invite.component.scss']
})
export class EmailInviteComponent {
  constructor(private dialog: MatDialog) {}

  openDialog() {
    const dialogConfig = {
      autoFocus: true,
      disableClose: true,
      panelClass: 'inviteDialogComponent'
    } as MatDialogConfig;
    this.dialog.open(InviteDialogComponent, dialogConfig);
  }
}
