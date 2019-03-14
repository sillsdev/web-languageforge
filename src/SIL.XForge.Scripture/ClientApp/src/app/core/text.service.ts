import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';

import { JsonApiService, QueryObservable } from 'xforge-common/json-api.service';
import { JsonDataId } from 'xforge-common/models/json-data';
import { RealtimeService } from 'xforge-common/realtime.service';
import { ResourceService } from 'xforge-common/resource.service';
import { CommentService } from './comment.service';
import { Text } from './models/text';
import { TextData, TextDataId } from './models/text-data';
import { QuestionService } from './question.service';

@Injectable({
  providedIn: 'root'
})
export class TextService extends ResourceService {
  constructor(
    jsonApiService: JsonApiService,
    private readonly commentService: CommentService,
    private readonly questionService: QuestionService,
    private readonly realtimeService: RealtimeService
  ) {
    super(Text.TYPE, jsonApiService);

    this.jsonApiService.resourceDeleted<Text>(this.type).subscribe(text => {
      for (const chapter of text.chapters) {
        this.realtimeService.localDelete(this.dataIdentity(new TextDataId(text.id, chapter.number, 'source')));
        this.realtimeService.localDelete(this.dataIdentity(new TextDataId(text.id, chapter.number, 'target')));
        const jsonDataId = new JsonDataId(text.id, chapter.number);
        this.questionService.localDelete(jsonDataId);
        this.commentService.localDelete(jsonDataId);
      }
    });
  }

  connect(id: TextDataId): Promise<TextData> {
    return this.realtimeService.connect(this.dataIdentity(id));
  }

  disconnect(textData: TextData): Promise<void> {
    return this.realtimeService.disconnect(textData);
  }

  get(id: string, include?: string[][]): QueryObservable<Text> {
    return this.jsonApiService.get(this.identity(id), include);
  }

  private dataIdentity(id: TextDataId): RecordIdentity {
    return this.identity(id.toString());
  }
}
