import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';
import { clone } from '@orbit/utils';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { registerCustomFilter } from './custom-filter-specifier';
import { GetAllParameters, JsonApiService, QueryObservable, QueryResults } from './json-api.service';
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

  constructor(jsonApiService: JsonApiService, private readonly authService: AuthService) {
    super(User.TYPE, jsonApiService);

    registerCustomFilter(this.type, UserService.SEARCH_FILTER, (r, v) => this.searchUsers(r, v));
  }

  get currentUserId(): string {
    return this.authService.currentUserId;
  }

  hasCurrentUserRole(role: string): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(userResult => {
        const currentUser = userResult.results;
        return currentUser && currentUser.role === role;
      })
    );
  }

  /** Get currently-logged in user. */
  getCurrentUser(): QueryObservable<T> {
    return this.jsonApiService.get<T>(this.identity(this.currentUserId));
  }

  /**
   * Update user attributes in database optimistically.
   * Pass a Partial<User> specifying the attributes to update.
   */
  updateUserAttributes(updatedAttributes: Partial<T>): Promise<T> {
    return this.jsonApiService.updateAttributes<T>(this.identity(this.currentUserId), updatedAttributes);
  }

  async onlineChangePassword(newPassword: string): Promise<void> {
    const attrs: Partial<T> = { password: newPassword } as Partial<T>;
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

  async onlineCreate(newUser: Partial<T>): Promise<T> {
    return await this.jsonApiService.onlineCreate<T>(this.newUser(newUser));
  }

  async onlineUpdateAttributes(updateUserId: string, updateUser: Partial<T>): Promise<T> {
    const attrs: Partial<T> = clone(updateUser);
    if ('id' in attrs) {
      delete attrs.id;
    }
    return await this.jsonApiService.onlineUpdateAttributes<T>(this.identity(updateUserId), attrs);
  }

  onlineGet(userId: string): QueryObservable<T> {
    return this.jsonApiService.onlineGet(this.identity(userId));
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

  protected abstract newUser(user: Partial<T>): T;
}
