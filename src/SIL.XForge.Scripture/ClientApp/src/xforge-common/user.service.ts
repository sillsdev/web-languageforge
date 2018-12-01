import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';
import { clone } from '@orbit/utils';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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

  constructor(jsonApiService: JsonApiService, private readonly authService: AuthService) {
    super(User.TYPE, jsonApiService);

    registerCustomFilter(this.type, UserService.SEARCH_FILTER, (r, v) => this.searchUsers(r, v));
  }

  get currentUserId(): string {
    return this.authService.currentUserId;
  }

  async onlineChangePassword(newPassword: string): Promise<void> {
    const attrs: Partial<User> = { password: newPassword };
    await this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs);
  }

  onlineGetProjects(id: string): QueryObservable<ProjectUser[]> {
    return this.jsonApiService.onlineGetAllRelated(this.identity(id), nameof<User>('projects'));
  }

  /** Get currently-logged in user. */
  getUser(): QueryObservable<User> {
    return this.jsonApiService.get<User>(this.identity(this.currentUserId));
  }

  /**
   * Update user attributes in database optimistically.
   * Pass a Partial<User> specifying the attributes to update.
   */
  updateUserAttributes(updatedAttributes: Partial<User>): Promise<User> {
    return this.jsonApiService.updateAttributes<User>(this.identity(this.currentUserId), updatedAttributes);
  }

  onlineAddUser(userAccountDetail: any): Promise<any> {
    return this.jsonApiService.onlineCreate(userAccountDetail);
  }

  onlineUpdateUser(updateUser: any): Promise<any> {
    let attrs: Partial<User> = {};
    if (updateUser.Password) {
      attrs = {
        active: updateUser.Active,
        email: updateUser.Email,
        name: updateUser.Name,
        role: updateUser.Role,
        username: updateUser.Username,
        password: updateUser.Password
      };
    } else {
      attrs = {
        active: updateUser.Active,
        email: updateUser.Email,
        name: updateUser.Name,
        role: updateUser.Role,
        username: updateUser.Username
      };
    }
    return this.jsonApiService.onlineUpdateAttributes(this.identity(updateUser.Id), attrs);
  }

  onlineGetUser(userId: string): Observable<any> {
    return this.jsonApiService.onlineGet(this.identity(userId));
  }

  onlineDeleteUser(userId: string): Promise<any> {
    return this.jsonApiService.onlineDelete(this.identity(userId));
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
}
