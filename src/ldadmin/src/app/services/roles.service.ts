import { Injectable } from '@angular/core';
import { JsonApiService } from './json-api.service';
import { Role } from '../models/role.model';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  roles = new ReplaySubject<Role[]>(1);

  constructor(private readonly jsonApi: JsonApiService) {
    this.jsonApi.call('/api/roles').pipe(
      map((roles: any[]) => roles.map((role: any[]) => ({id: role[0], name: role[1]})))
    )
    .subscribe(this.roles);
  }
}
