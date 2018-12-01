import { Injectable } from '@angular/core';

import { UserService } from '@xforge-common/user.service';
import { SFUser } from './models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFUserService<T extends SFUser = SFUser> extends UserService<T> {}
