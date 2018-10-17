import { Injectable } from '@angular/core';

import { ProjectService } from '@xforge-common/project.service';
import { SFProject } from '../shared/models/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends ProjectService<SFProject> { }
