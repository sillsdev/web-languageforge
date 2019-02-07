import { MdcSnackbar, MdcSnackbarConfig } from '@angular-mdc/web';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

/** Manages and provides access to notices shown to user on the web site. */
@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private _isLoading: boolean = false;

  constructor(private readonly snackbar: MdcSnackbar, private readonly authService: AuthService) {}

  get isLoading(): boolean {
    return this._isLoading;
  }

  loadingStarted(): void {
    setTimeout(() => (this._isLoading = true));
  }

  loadingFinished(): void {
    setTimeout(() => (this._isLoading = false));
  }

  async show(message: string): Promise<void> {
    let config: MdcSnackbarConfig<any>;
    if (!(await this.authService.isLoggedIn)) {
      config = { classes: 'snackbar-above-footer' };
    }
    this.snackbar.open(message, undefined, config);
  }
}
