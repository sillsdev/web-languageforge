import { MdcTopAppBar } from '@angular-mdc/web';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'xforge-common/auth.service';
import { LocationService } from 'xforge-common/location.service';
import { User } from 'xforge-common/models/user';
import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends SubscriptionDisposable implements OnInit {
  @ViewChild(NavMenuComponent) navMenu: NavMenuComponent;
  today = new Date();
  version = '9.9.9';

  currentUser$: Observable<User>;

  private _topAppBar: MdcTopAppBar;
  private _isTopAppBarShort: boolean = true;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly noticeService: NoticeService,
    media: ObservableMedia
  ) {
    super();
    this.subscribe(media.asObservable(), (change: MediaChange) => {
      if (['xs', 'sm'].includes(change.mqAlias)) {
        this.isTopAppBarShort = false;
      } else {
        this.isTopAppBarShort = true;
      }
    });
  }

  @ViewChild('topAppBar')
  set topAppBar(value: MdcTopAppBar) {
    this._topAppBar = value;
    this.setTopAppBarShort();
  }

  set isTopAppBarShort(value: boolean) {
    if (this._isTopAppBarShort !== value) {
      this._isTopAppBarShort = value;
      this.setTopAppBarShort();
    }
  }

  get isTopAppBarShort(): boolean {
    return this._isTopAppBarShort;
  }

  async ngOnInit(): Promise<void> {
    this.authService.init();
    if (await this.isLoggedIn) {
      this.currentUser$ = this.userService.getCurrentUser();
    }
  }

  get isLoggedIn(): Promise<boolean> {
    return this.authService.isLoggedIn;
  }

  get isLoading(): boolean {
    return this.noticeService.isLoading;
  }

  logOut(): void {
    this.authService.logOut();
  }

  async goHome(): Promise<void> {
    (await this.isLoggedIn) ? this.router.navigateByUrl('/projects') : this.locationService.go('/');
  }

  private setTopAppBarShort(): void {
    if (this._topAppBar == null) {
      return;
    }
    if (this._isTopAppBarShort !== this._topAppBar.short) {
      this._topAppBar.setShort(this._isTopAppBarShort, true);
    }
    if (this._isTopAppBarShort === this._topAppBar.dense) {
      this._topAppBar.setDense(!this._isTopAppBarShort, true);
    }
  }
}
