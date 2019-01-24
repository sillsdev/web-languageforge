import { MDC_DIALOG_DATA } from '@angular-mdc/web';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-delete-project-dialog',
  templateUrl: 'delete-project-dialog.component.html'
})
export class DeleteProjectDialogComponent implements OnInit {
  projectNameEntry = new FormControl('');

  constructor(@Inject(MDC_DIALOG_DATA) public data: { name: string }) {}

  ngOnInit() {}

  get deleteDisabled() {
    return this.data.name.toLowerCase() !== this.projectNameEntry.value.toLowerCase();
  }
}
