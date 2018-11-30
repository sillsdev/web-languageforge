import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';
import { clone } from '@orbit/utils';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { registerCustomFilter } from './custom-filter-specifier';
import { GetAllParameters, JsonApiService, QueryObservable } from './json-api.service';
import { Project } from './models/project';
import { NONE_ROLE, ProjectRole } from './models/project-role';
import { ResourceService } from './resource.service';
import { nameof } from './utils';

export enum InviteAction {
  None = 'none',
  Joined = 'joined',
  Invited = 'invited'
}

@Injectable()
export abstract class ProjectService<T extends Project = Project> extends ResourceService {
  private static readonly SEARCH_FILTER = 'search';

  readonly roles: Map<string, ProjectRole>;

  constructor(jsonApiService: JsonApiService, roles: ProjectRole[]) {
    super(Project.TYPE, jsonApiService);

    registerCustomFilter(this.type, ProjectService.SEARCH_FILTER, (r, v) => this.searchProjects(r, v));
    this.roles = new Map<string, ProjectRole>();
    for (const role of roles) {
      this.roles.set(role.role, role);
    }
    this.roles.set(NONE_ROLE.role, NONE_ROLE);
  }

  getAll(parameters?: GetAllParameters<T>, include?: string[]): QueryObservable<T[]> {
    return this.jsonApiService.getAll(this.type, parameters, include);
  }

  onlineUpdateAttributes(id: string, attrs: Partial<T>): Promise<T> {
    return this.jsonApiService.onlineUpdateAttributes(this.identity(id), attrs);
  }

  onlineCreate(project: T): Promise<T> {
    return this.jsonApiService.onlineCreate(project);
  }

  onlineSearch(term$: Observable<string>, parameters$: Observable<GetAllParameters<T>>): QueryObservable<T[]> {
    const debouncedTerm$ = term$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    );

    return combineLatest(debouncedTerm$, parameters$).pipe(
      switchMap(([term, parameters]) => {
        let currentParameters = parameters;
        if (term != null && term !== '') {
          currentParameters = clone(parameters);
          if (currentParameters.filters == null) {
            currentParameters.filters = [];
          }
          currentParameters.filters.push({ name: ProjectService.SEARCH_FILTER, value: term });
        }
        return this.jsonApiService.onlineGetAll(this.type, currentParameters);
      })
    );
  }

  onlineInvite(email: string): Promise<InviteAction> {
    return this.jsonApiService.onlineInvoke(this.type, 'invite', { email });
  }

  private searchProjects(records: Record[], value: string): Record[] {
    const valueLower = value.toLowerCase();
    return records.filter(record => this.isSearchMatch(record, valueLower));
  }

  protected isSearchMatch(record: Record, value: string): boolean {
    if (record.attributes == null) {
      return false;
    }

    const projectName = record.attributes[nameof<Project>('projectName')] as string;
    if (projectName != null && projectName.toLowerCase().includes(value)) {
      return true;
    }

    return false;
  }
}
