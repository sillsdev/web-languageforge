import { Injectable } from '@angular/core';

import { UserService } from '@xforge-common/user.service';
import { SFUser } from './models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFUserService extends UserService<SFUser> {
  protected newUser(user: Partial<SFUser>): SFUser {
    return new SFUser(user);
  }
}
