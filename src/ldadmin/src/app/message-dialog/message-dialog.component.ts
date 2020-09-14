import { MDC_DIALOG_DATA } from '@angular-mdc/web/dialog';
import { Component, Inject } from '@angular/core';

export interface MessageDialogData {
  message: () => string;
  closeButtonText?: () => string;
}

/** Copied verbatim from xForge. */
@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html'
})
export class MessageDialogComponent {
  constructor(@Inject(MDC_DIALOG_DATA) private readonly data: MessageDialogData) {}

  get message(): string {
    return this.data.message();
  }

  get closeButtonText(): string {
    return this.data.closeButtonText ? this.data.closeButtonText() : 'Dismiss';
  }
}
