import { Component, Input } from '@angular/core';

import { User } from '../models/user';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent {
  show: boolean = true;
  @Input() round: boolean = false;
  @Input() size: number = 32;

  private _user: Partial<User>;

  get user(): Partial<User> {
    return this._user;
  }

  @Input()
  set user(value: Partial<User>) {
    // Force avatar to refresh. Some discussion about this is at
    // https://github.com/HaithemMosbahi/ngx-avatar/issues/18.
    this.show = false;
    this._user = value;
    setTimeout(() => (this.show = true), 0);
  }

  get avatarUrl(): string {
    return this.user ? this.user.avatarUrl : '';
  }

  get googleId(): string {
    return this.user && this.user.avatarUrl == null ? this.user.googleId : '';
  }

  get email(): string {
    return this.user && this.user.avatarUrl == null ? this.user.email : '';
  }

  get name(): string {
    return this.user ? this.user.name : '';
  }
}
