import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';
import { clone } from '@orbit/utils';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';

import { registerCustomFilter } from '@xforge-common/custom-filter-specifier';
import { GetAllParameters, JSONAPIService, QueryObservable } from '@xforge-common/jsonapi.service';
import { InputSystem } from '@xforge-common/models/input-system';
import { ProjectService } from '@xforge-common/project.service';
import { nameof } from '@xforge-common/utils';
import { SFProject } from './models/sfproject';
import { Text } from './models/text';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends ProjectService<SFProject> {
  private static readonly SEARCH_FILTER = 'search';

  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService);

    registerCustomFilter(this.type, SFProjectService.SEARCH_FILTER, (r, v) => this.searchProjects(r, v));
  }

  localGetTexts(project: SFProject | string): Text[] {
    if (typeof project === 'string') {
      project = this.jsonApiService.localGet(this.identity(project));
    }
    return this.jsonApiService.localGetMany(project.texts);
  }

  search(term$: Observable<string>, parameters: GetAllParameters<SFProject> = { }): QueryObservable<SFProject[]> {
    if (parameters.filters == null) {
      parameters.filters = [];
    }
    return term$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      startWith(''),
      switchMap(term => {
        let currentParameters = parameters;
        if (term != null && term !== '') {
          currentParameters = clone(parameters);
          currentParameters.filters.push({ name: SFProjectService.SEARCH_FILTER, value: term });
        }
        return this.jsonApiService.getAll(this.type, currentParameters);
      })
    );
  }

  private searchProjects(records: Record[], value: string): Record[] {
    const valueLower = value.toLowerCase();
    return records.filter(record => {
      if (record.attributes == null) {
        return false;
      }

      const projectName = record.attributes[nameof<SFProject>('projectName')] as string;
      if (projectName != null && projectName.toLowerCase().includes(valueLower)) {
        return true;
      }

      const inputSystem = record.attributes[nameof<SFProject>('inputSystem')] as InputSystem;
      if (inputSystem != null && inputSystem.languageName.toLowerCase().includes(valueLower)) {
        return true;
      }

      return false;
    });
  }
}
