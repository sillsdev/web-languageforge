import { Injectable } from '@angular/core';

import { GetAllParameters, JsonApiService, QueryObservable } from 'xforge-common/json-api.service';
import { ResourceService } from 'xforge-common/resource.service';
import { Question } from './models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService<T extends Question = Question> extends ResourceService {
  constructor(jsonApiService: JsonApiService) {
    super(Question.TYPE, jsonApiService);
  }

  getAll(parameters?: GetAllParameters<T>, include?: string[]): QueryObservable<T[]> {
    return this.jsonApiService.getAll(this.type, parameters, include);
  }

  get(id: string, include?: string[]): QueryObservable<T> {
    return this.jsonApiService.get(this.identity(id), include);
  }

  create(question: T): Promise<T> {
    return this.jsonApiService.create(question);
  }
}
