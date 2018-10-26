import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { ResourceService } from '@xforge-common/resource.service';
import { Observable } from 'rxjs';
import { SFProjectUser } from '../app/shared/models/sfproject-user';
import { ProjectUser } from './models/project-user';

@Injectable({
  providedIn: 'root'
})
export class ProjectUserService<T extends ProjectUser = ProjectUser> extends ResourceService {
  constructor(jsonApiService: JSONAPIService) {
    super(ProjectUser.TYPE, jsonApiService);
  }

  onlineCreate(projectUser: T): Promise<string> {
    return this.jsonApiService.onlineCreate(projectUser);
  }

  onlineGet(id: string): Observable<any> {
    alert('service');
    // return this.jsonApiService.onlineGet(this.identity(id));
    // return this.jsonApiService.onlineGet({ type: SFProjectUser.TYPE, id: id },  false);
    return this.jsonApiService.onlineGetAll( SFProjectUser.TYPE, null, true);


    // return this.jsonApiService.onlineGetAll('',(this.identity(id), true);

  }

  delete(id: string): Promise<void> {
    alert('deleting');
    return this.jsonApiService.onlineDelete(this.identity(id), false);
  }
}
