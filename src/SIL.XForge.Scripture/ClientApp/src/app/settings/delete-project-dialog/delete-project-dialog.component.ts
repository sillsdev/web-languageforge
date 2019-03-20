import { MDC_DIALOG_DATA } from '@angular-mdc/web';
import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: 'delete-project-dialog.component.html'
})
export class DeleteProjectDialogComponent {
  projectNameEntry = new FormControl('');

  constructor(@Inject(MDC_DIALOG_DATA) public data: { name: string }) {}

  get deleteDisabled() {
    return this.data.name.toLowerCase() !== this.projectNameEntry.value.toLowerCase();
  }
}
