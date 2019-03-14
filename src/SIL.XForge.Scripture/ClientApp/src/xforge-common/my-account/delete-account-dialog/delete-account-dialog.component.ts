import { MDC_DIALOG_DATA, MdcDialogRef } from '@angular-mdc/web';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account-dialog.component.html',
  styleUrls: ['./delete-account-dialog.component.scss']
})
export class DeleteAccountDialogComponent {
  userName: string;
  userNameEntry = new FormControl('');

  get deleteDisabled() {
    return this.userNameEntry.value.toLowerCase() !== this.data.name.toLowerCase();
  }

  constructor(
    public dialogRef: MdcDialogRef<DeleteAccountDialogComponent>,
    @Inject(MDC_DIALOG_DATA) public data: { name: string }
  ) {}
}
