import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

/**
 * Dialog to confirm change of username, such as from my-account.
 */
@Component({
  selector: 'app-changing-username-dialog',
  templateUrl: './changing-username-dialog.component.html'
})
export class ChangingUsernameDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ChangingUsernameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
