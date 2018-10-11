import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { SFProjectUser } from '../shared/models/sfproject-user';

@Injectable({
  providedIn: 'root'
})
export class SFProjectUserService {
  constructor(private readonly jsonApiService: JSONAPIService) { }

  onlineCreate(resource: SFProjectUser): Promise<string> {
    return this.jsonApiService.create(resource, true, true);
  }
}
