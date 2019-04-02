import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';
import { JsonApiService, QueryObservable } from 'xforge-common/json-api.service';
import { RealtimeService } from 'xforge-common/realtime.service';
import { ResourceService } from 'xforge-common/resource.service';
import { CommentData } from './models/comment-data';
import { QuestionData } from './models/question-data';
import { Text } from './models/text';
import { TextData, TextDataId } from './models/text-data';
import { TextJsonDataId } from './models/text-json-data-id';

@Injectable({
  providedIn: 'root'
})
export class TextService extends ResourceService {
  constructor(jsonApiService: JsonApiService, private readonly realtimeService: RealtimeService) {
    super(Text.TYPE, jsonApiService);

    this.jsonApiService.resourceDeleted<Text>(this.type).subscribe(text => {
      for (const chapter of text.chapters) {
        this.realtimeService.localDelete(this.textDataIdentity(new TextDataId(text.id, chapter.number, 'source')));
        this.realtimeService.localDelete(this.textDataIdentity(new TextDataId(text.id, chapter.number, 'target')));
        const jsonDataId = new TextJsonDataId(text.id, chapter.number);
        this.realtimeService.localDelete(this.questionDataIdentity(jsonDataId));
        this.realtimeService.localDelete(this.commentDataIdentity(jsonDataId));
      }
    });
  }

  get(id: string, include?: string[][]): QueryObservable<Text> {
    return this.jsonApiService.get(this.identity(id), include);
  }

  getTextData(id: TextDataId): Promise<TextData> {
    return this.realtimeService.get(this.textDataIdentity(id));
  }

  getQuestionData(id: TextJsonDataId): Promise<QuestionData> {
    return this.realtimeService.get(this.questionDataIdentity(id));
  }

  getCommentData(id: TextJsonDataId): Promise<CommentData> {
    return this.realtimeService.get(this.commentDataIdentity(id));
  }

  private textDataIdentity(id: TextDataId): RecordIdentity {
    return this.identity(id.toString());
  }

  private questionDataIdentity(id: TextJsonDataId): RecordIdentity {
    return { type: QuestionData.TYPE, id: id.toString() };
  }

  private commentDataIdentity(id: TextJsonDataId): RecordIdentity {
    return { type: CommentData.TYPE, id: id.toString() };
  }
}
