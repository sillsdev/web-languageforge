import { Injectable } from '@angular/core';

import { JsonApiService } from 'xforge-common/json-api.service';
import { RealtimeService } from 'xforge-common/realtime.service';
import { ResourceService } from 'xforge-common/resource.service';
import { QuestionData } from './models/question-data';

@Injectable({
  providedIn: 'root'
})
export class QuestionService extends ResourceService {
  constructor(jsonApiService: JsonApiService, private readonly realtimeService: RealtimeService) {
    super(QuestionData.TYPE, jsonApiService);
  }

  connect(textId: string): Promise<QuestionData> {
    return this.realtimeService.connect(this.identity(textId));
  }

  disconnect(questionData: QuestionData): Promise<void> {
    return this.realtimeService.disconnect(questionData);
  }
}
