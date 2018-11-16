import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { GetAllParameters, JSONAPIService, QueryObservable } from './jsonapi.service';
import { User } from './models/user';
import { ResourceService } from './resource.service';

@Injectable()
export class UserService<T extends User = User> extends ResourceService {
  constructor(jsonApiService: JSONAPIService, private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {
    super(User.TYPE, jsonApiService);
  }

  get currentUserId(): string {
    return this.authService.currentUserId;
  }

  async onlineChangePassword(newPassword: string): Promise<void> {
    const attrs: Partial<User> = { password: newPassword };
    await this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs);
  }

  getAll(parameters?: GetAllParameters<T>, include?: string[]): QueryObservable<T[]> {
    return this.jsonApiService.getAll(this.type, parameters, include);
  }

  sendInvitation(name: string, email: string): Observable<string> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return this.http.post(environment.siteOrigin + '/Account/SendInvitation',
      JSON.stringify({ name, email }), { headers: headers, responseType: 'text' })
      .pipe(map(response => response));
  }
}
