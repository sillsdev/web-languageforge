import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  templateUrl: './sa-delete-dialog.component.html'
})
export class SaDeleteDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<SaDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  confirmDialog(): void {
    this.dialogRef.close('confirmed');
  }

  closeDialog(): void {
    this.dialogRef.close('notconfirmed');
  }
}
