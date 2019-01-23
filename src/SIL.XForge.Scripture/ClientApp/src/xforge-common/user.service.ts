import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';
import { clone } from '@orbit/utils';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { registerCustomFilter } from './custom-filter-specifier';
import { GetAllParameters, JsonApiService, QueryObservable } from './json-api.service';
import { ProjectUser } from './models/project-user';
import { User } from './models/user';
import { ResourceService } from './resource.service';
import { nameof } from './utils';

/**
 * Provides operations on user objects. See also SFUserService.
 */
@Injectable()
export abstract class UserService<T extends User = User> extends ResourceService {
  private static readonly SEARCH_FILTER = 'search';

  private currentUser$: Observable<T>;

  constructor(
    type: string,
    jsonApiService: JsonApiService,
    private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {
    super(type, jsonApiService);

    registerCustomFilter(this.type, UserService.SEARCH_FILTER, (r, v) => this.searchUsers(r, v));
  }

  get currentUserId(): string {
    return this.authService.currentUserId;
  }

  hasCurrentUserRole(role: string): Observable<boolean> {
    return this.getCurrentUser().pipe(map(currentUser => currentUser && currentUser.role === role));
  }

  /** Get currently-logged in user. */
  getCurrentUser(): Observable<T> {
    if (this.currentUser$ == null) {
      this.currentUser$ = this.jsonApiService.get<T>(this.identity(this.currentUserId)).pipe(
        map(r => r.results),
        filter(u => u != null),
        shareReplay(1)
      );
    }
    return this.currentUser$;
  }

  /**
   * Update the current user's attributes remotely and then locally.
   * Pass a Partial<User> specifying the attributes to update.
   */
  async onlineUpdateCurrentUserAttributes(attrs: Partial<T>): Promise<T> {
    const updatedUser = await this.jsonApiService.onlineUpdateAttributes<T>(this.identity(this.currentUserId), attrs);
    return await this.jsonApiService.localUpdate(updatedUser);
  }

  async onlineChangePassword(newPassword: string): Promise<void> {
    const attrs = { password: newPassword } as Partial<T>;
    await this.jsonApiService.onlineUpdateAttributes<T>(this.identity(this.currentUserId), attrs);
  }

  onlineGetProjects(id: string): QueryObservable<ProjectUser[]> {
    return this.jsonApiService.onlineGetAllRelated(this.identity(id), nameof<User>('projects'));
  }

  async onlineUnlinkParatextAccount(): Promise<void> {
    const attrs: Partial<User> = { paratextId: null };
    await this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs);
  }

  async onlineDelete(id: string): Promise<void> {
    await this.jsonApiService.onlineDelete(this.identity(id));
  }

  async onlineCreate(init: Partial<T>): Promise<T> {
    return await this.jsonApiService.onlineCreate<T>(this.jsonApiService.newResource(this.type, init));
  }

  async onlineUpdateAttributes(id: string, attrs: Partial<T>): Promise<T> {
    return await this.jsonApiService.onlineUpdateAttributes<T>(this.identity(id), attrs);
  }

  onlineGet(id: string): QueryObservable<T> {
    return this.jsonApiService.onlineGet(this.identity(id));
  }

  onlineSearch(
    term$: Observable<string>,
    parameters$: Observable<GetAllParameters<T>>,
    reload$: Observable<void>,
    include?: string[]
  ): QueryObservable<T[]> {
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
        return this.jsonApiService.onlineGetAll<T>(this.type, currentParameters, include);
      })
    );
  }

  /**
   * Uploads the specified image file as the current user's avatar.
   *
   * @param {File} file The file to upload.
   * @returns {Promise<string>} The relative url to the uploaded avatar file.
   */
  async uploadCurrentUserAvatar(file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.http
      .post<HttpResponse<string>>(`json-api/users/${this.currentUserId}/avatar`, formData, {
        headers: { Accept: 'application/json' },
        observe: 'response'
      })
      .toPromise();
    const attrs = { avatarUrl: response.headers.get('Location') } as Partial<T>;
    return await this.jsonApiService.localUpdateAttributes<T>(this.identity(this.currentUserId), attrs);
  }

  private searchUsers(records: Record[], value: string): Record[] {
    const valueLower = value.toLowerCase();
    return records.filter(record => this.isSearchMatch(record, valueLower));
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
}
