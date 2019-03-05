import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';
import { clone } from '@orbit/utils';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { registerCustomFilter } from './custom-filter-specifier';
import { GetAllParameters, JsonApiService, QueryObservable } from './json-api.service';
import { ProjectUser } from './models/project-user';
import { User } from './models/user';
import { ResourceService } from './resource.service';
import { nameof } from './utils';

/**
 * Provides operations on user objects.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService extends ResourceService {
  private static readonly SEARCH_FILTER = 'search';

  private currentUser$: Observable<User>;

  constructor(
    jsonApiService: JsonApiService,
    private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {
    super(User.TYPE, jsonApiService);

    registerCustomFilter(this.type, UserService.SEARCH_FILTER, (r, v) => this.searchUsers(r, v));
  }

  get currentUserId(): string {
    return this.authService.currentUserId;
  }

  hasCurrentUserRole(role: string): Observable<boolean> {
    return this.getCurrentUser().pipe(map(currentUser => currentUser && currentUser.role === role));
  }

  hasCurrentUserProjectRole(projectId: string, role: string): Observable<boolean> {
    if (!projectId) {
      return of(false);
    }

    return this.getProjects(this.currentUserId).pipe(
      map(projectUserResults => {
        for (const projectUser of projectUserResults.data) {
          if (projectUser && projectUser.project.id === projectId) {
            return projectUser.role === role;
          }
        }

        return false;
      })
    );
  }

  /** Get currently-logged in user. */
  getCurrentUser(): Observable<User> {
    if (this.currentUser$ == null) {
      this.currentUser$ = this.jsonApiService.get<User>(this.identity(this.currentUserId)).pipe(
        map(r => r.data),
        filter(u => u != null),
        shareReplay(1)
      );
    }
    return this.currentUser$;
  }

  getProjects(id: string, include?: string[][]): QueryObservable<ProjectUser[]> {
    return this.jsonApiService.getAllRelated(this.identity(id), nameof<User>('projects'), include);
  }

  async updateCurrentProjectId(projectId: string = null): Promise<User> {
    return this.jsonApiService.updateAttributes<User>(this.identity(this.currentUserId), {
      site: { currentProjectId: projectId }
    });
  }

  /**
   * Update the current user's attributes remotely and then locally.
   * Pass a Partial<User> specifying the attributes to update.
   */
  onlineUpdateCurrentUserAttributes(attrs: Partial<User>): Promise<User> {
    return this.jsonApiService.onlineUpdateAttributes<User>(this.identity(this.currentUserId), attrs, true);
  }

  async onlineChangePassword(newPassword: string): Promise<void> {
    const attrs = { password: newPassword } as Partial<User>;
    await this.jsonApiService.onlineUpdateAttributes<User>(this.identity(this.currentUserId), attrs);
  }

  onlineGetProjects(id: string): QueryObservable<ProjectUser[]> {
    return this.jsonApiService.onlineGetAllRelated(this.identity(id), nameof<User>('projects'));
  }

  async onlineUnlinkParatextAccount(): Promise<void> {
    const attrs: Partial<User> = { paratextId: null };
    await this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs, true);
  }

  async onlineDelete(id: string): Promise<void> {
    await this.jsonApiService.onlineDelete(this.identity(id));
  }

  async onlineCreate(init: Partial<User>): Promise<User> {
    return await this.jsonApiService.onlineCreate<User>(new User(init));
  }

  async onlineUpdateAttributes(id: string, attrs: Partial<User>): Promise<User> {
    return await this.jsonApiService.onlineUpdateAttributes<User>(this.identity(id), attrs);
  }

  onlineGet(id: string): QueryObservable<User> {
    return this.jsonApiService.onlineGet(this.identity(id));
  }

  onlineSearch(
    term$: Observable<string>,
    parameters$: Observable<GetAllParameters<User>>,
    reload$: Observable<void>,
    include?: string[][]
  ): QueryObservable<User[]> {
    const debouncedTerm$ = term$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    );

    return combineLatest(debouncedTerm$, parameters$, reload$).pipe(
      switchMap(([term, parameters]) => {
        let currentParameters = parameters;
        if (term != null && term !== '') {
          currentParameters = clone(parameters);
          if (currentParameters.filters == null) {
            currentParameters.filters = [];
          }
          currentParameters.filters.push({ name: UserService.SEARCH_FILTER, value: term });
        }
        return this.jsonApiService.onlineGetAll<User>(this.type, currentParameters, include);
      })
    );
  }

  /**
   * Uploads the specified image file as the current user's avatar.
   *
   * @param {File} file The file to upload.
   * @returns {Promise<string>} The relative url to the uploaded avatar file.
   */
  async uploadCurrentUserAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.http
      .post<HttpResponse<string>>(`json-api/users/${this.currentUserId}/avatar`, formData, {
        headers: { Accept: 'application/json' },
        observe: 'response'
      })
      .toPromise();
    const attrs = { avatarUrl: response.headers.get('Location') } as Partial<User>;
    return await this.jsonApiService.localUpdateAttributes<User>(this.identity(this.currentUserId), attrs);
  }

  protected isSearchMatch(record: Record, value: string): boolean {
    if (record.attributes == null) {
      return false;
    }

    const userName = record.attributes[nameof<User>('name')] as string;
    const userEmail = record.attributes[nameof<User>('canonicalEmail')] as string;
    if (
      (userName != null && userName.toLowerCase().includes(value)) ||
      (userEmail != null && userEmail.includes(value))
    ) {
      return true;
    }

    return false;
  }

  private searchUsers(records: Record[], value: string): Record[] {
    const valueLower = value.toLowerCase();
    return records.filter(record => this.isSearchMatch(record, valueLower));
  }
}
