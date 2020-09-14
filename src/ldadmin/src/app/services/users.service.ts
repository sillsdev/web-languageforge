import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JsonApiService } from './json-api.service';
import { User } from '../models/user.model';
import { Project, ApiProject, toProject } from '../models/project.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

constructor(private readonly jsonApi: JsonApiService) { }

  public getUsers(): Observable<User[]> {
    return this.jsonApi.call('/api/users');
  }

  public getUser(username: string): Observable<User> {
    return this.jsonApi.call(`/api/users/${username}`);
  }

  public modifyUser(user: User): Observable<User> {
    const loginInfo = { username: user.username, password: '' };
    const body = {
      login: loginInfo,
      username: user.username,
      password: '', // Password changes are a different API call
      mustChangePassword: false,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language,
      emailAddresses: user.email,  // TODO: Change "emailAddresses" to "email" in API, because we now allow only one address
    };
    return this.jsonApi.put(`/api/users/${user.username}`, body);
  }

  public createUser(body: any): Observable<User> {
    return this.jsonApi.createUserExp<User>(body);
  }

  public searchUsers(searchText: string): Observable<User[]> {
    return this.jsonApi.call(`/api/searchUsers/${searchText}`);
  }

  public getProjectsForUser(username: string): Observable<[Project, string][]> {
    return this.jsonApi.call<[ApiProject, string][]>(`/api/users/${username}/projects`).pipe(
      map(results => results.map(([proj, role]) => [toProject(proj), role]))
    );
  }
  // TODO: That's the second time we've needed that map(apiProjects => apiProjects.map(proj => toProject(proj))) pipe.
  // Move that to a utility service that both ProjectsService and UsersService can import, so we don't duplicate code
}
