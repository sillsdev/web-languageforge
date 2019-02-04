import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DomainModel } from 'xforge-common/models/domain-model';
import { ProjectUserService } from 'xforge-common/project-user.service';
import { ProjectService } from 'xforge-common/project.service';
import { UserService } from 'xforge-common/user.service';
import { SFDOMAIN_MODEL_CONFIG } from './models/sfdomain-model-config.generated';
import { SFProjectUserService } from './sfproject-user.service';
import { SFProjectService } from './sfproject.service';
import { SFUserService } from './sfuser.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [
    { provide: UserService, useExisting: SFUserService },
    { provide: ProjectService, useExisting: SFProjectService },
    { provide: ProjectUserService, useExisting: SFProjectUserService },
    { provide: DomainModel, useFactory: () => new DomainModel(SFDOMAIN_MODEL_CONFIG) }
  ]
})
export class CoreModule {}
