import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';
import { JsonApiService } from 'xforge-common/json-api.service';
import { JsonDataId } from 'xforge-common/models/json-data';
import { RealtimeService } from 'xforge-common/realtime.service';
import { ResourceService } from 'xforge-common/resource.service';
import { CommentData } from './models/comment-data';

@Injectable({
  providedIn: 'root'
})
export class CommentService extends ResourceService {
  constructor(jsonApiService: JsonApiService, private readonly realtimeService: RealtimeService) {
    super(CommentData.TYPE, jsonApiService);
  }

  connect(id: JsonDataId): Promise<CommentData> {
    return this.realtimeService.connect(this.dataIdentity(id));
  }

  disconnect(commentData: CommentData): Promise<void> {
    return this.realtimeService.disconnect(commentData);
  }

  localDelete(id: JsonDataId) {
    this.realtimeService.localDelete(this.dataIdentity(id));
  }

  private dataIdentity(id: JsonDataId): RecordIdentity {
    return this.identity(id.toString());
  }
}
