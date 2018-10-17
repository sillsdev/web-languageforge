import { Injectable } from '@angular/core';
import { FindRecordsTerm } from '@orbit/data';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { LiveQueryObservable } from '@xforge-common/live-query-observable';
import { ResourceService } from '@xforge-common/resource.service';
import { Project } from './models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService<T extends Project = Project> extends ResourceService {
  constructor(jsonApiService: JSONAPIService) {
    super(Project.TYPE, jsonApiService);
  }

  getAll(expressionBuilder = (t: FindRecordsTerm) => t): LiveQueryObservable<T[]> {
    return this.jsonApiService.getAll(this.type, expressionBuilder);
  }

  update(project: T): Promise<void> {
    return this.jsonApiService.update(project);
  }

  onlineCreate(project: T): Promise<string> {
    return this.jsonApiService.onlineCreate(project);
  }
}
