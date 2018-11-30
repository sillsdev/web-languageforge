import { Injectable } from '@angular/core';

import { ProjectUserService } from '@xforge-common/project-user.service';
import { SFProjectUser } from './models/sfproject-user';

@Injectable({
  providedIn: 'root'
})
export class SFProjectUserService extends ProjectUserService<SFProjectUser> {}
