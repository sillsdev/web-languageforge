import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ProjectUserService } from '@xforge-common/project-user.service';
import { ProjectService } from '@xforge-common/project.service';
import { UserService } from '@xforge-common/user.service';
import { SFProjectUserService } from './sfproject-user.service';
import { SFProjectService } from './sfproject.service';
import { SFUserService } from './sfuser.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    { provide: UserService, useExisting: SFUserService },
    { provide: ProjectService, useExisting: SFProjectService },
    { provide: ProjectUserService, useExisting: SFProjectUserService }
  ]
})
export class CoreModule { }
