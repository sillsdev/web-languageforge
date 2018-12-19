import { Component } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { AuthService } from '@xforge-common/auth.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent extends SubscriptionDisposable {
  isExpanded = false;
  drawerType = 'permanent';

  constructor(private readonly authService: AuthService, private readonly media: ObservableMedia) {
    super();
    this.subscribe(media.asObservable(), (change: MediaChange) => {
      if (['xs', 'sm'].includes(change.mqAlias)) {
        this.collapseDrawer();
        this.drawerType = 'dismissible';
      } else {
        this.drawerType = 'permanent';
      }
    });
  }

  get isLoggedIn(): Promise<boolean> {
    return this.authService.isLoggedIn;
  }

  get isDrawerPermanent() {
    return this.drawerType === 'permanent';
  }

  collapseDrawer() {
    this.isExpanded = false;
  }

  openDrawer() {
    this.isExpanded = true;
  }

  toggleDrawer() {
    this.isExpanded = !this.isExpanded;
  }
}
