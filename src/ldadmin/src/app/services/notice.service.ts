import { MdcDialog, MdcDialogRef } from '@angular-mdc/web/dialog';
import { MdcSnackbar, MdcSnackbarConfig } from '@angular-mdc/web/snackbar';
import { Injectable } from '@angular/core';
import { MessageDialogComponent, MessageDialogData } from '../message-dialog/message-dialog.component';

/** Copied verbatim from xForge. */
@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private _isAppLoading: boolean = false;
  private loadingCount: number = 0;

  constructor(private readonly snackbar: MdcSnackbar, private readonly dialog: MdcDialog) {}

  get isAppLoading(): boolean {
    return this._isAppLoading;
  }

  loadingStarted(): void {
    if (this.loadingCount === 0) {
      setTimeout(() => (this._isAppLoading = true));
    }
    this.loadingCount++;
  }

  loadingFinished(): void {
    this.loadingCount--;
    if (this.loadingCount === 0) {
      setTimeout(() => (this._isAppLoading = false));
    }
  }

  async show(message: string): Promise<void> {
    return this.showSnackBar(message);
  }

  async showError(message: string): Promise<void> {
    return this.showSnackBar(message, ['snackbar-error']);
  }

  showMessageDialog(message: () => string, closeButtonText?: () => string): Promise<void> {
    const dialogRef = this.dialog.open<MessageDialogComponent, MessageDialogData>(MessageDialogComponent, {
      data: { message, closeButtonText }
    }) as MdcDialogRef<MessageDialogComponent, any>;

    return dialogRef.afterClosed().toPromise();
  }

  private async showSnackBar(message: string, classes: string[] = []): Promise<void> {
    let config: MdcSnackbarConfig<any> | undefined;
    config = { classes: classes.join(' ') };
    this.snackbar.open(message, undefined, config);
  }
}
