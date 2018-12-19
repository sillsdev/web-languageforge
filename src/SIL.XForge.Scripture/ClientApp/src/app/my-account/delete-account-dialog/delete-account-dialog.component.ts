import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account-dialog.component.html',
  styleUrls: ['./delete-account-dialog.component.scss']
})
export class DeleteAccountDialogComponent {
  userNameEntry = new FormControl('');

  get deleteDisabled() {
    return this.userNameEntry.value.toLowerCase() !== this.data.name.toLowerCase();
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {}
}
