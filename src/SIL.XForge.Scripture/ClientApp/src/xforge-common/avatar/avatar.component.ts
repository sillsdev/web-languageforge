import { Component, Input } from '@angular/core';
import { clone } from '@orbit/utils';
import { User } from '../models/user';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent {
  @Input() round: boolean = false;
  @Input() size: number = 32;

  @Input() set user(user: User) {
    this._user = user ? clone(user) : ({} as User);
    if (this._user.avatarUrl) {
      this._user.googleId = '';
      this._user.email = '';
    }
  }

  private _user: User;

  get user(): User {
    return this._user;
  }
}
