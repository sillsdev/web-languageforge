import { JsonData } from 'xforge-common/models/json-data';
import { RealtimeDoc } from 'xforge-common/realtime-doc';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { Comment } from './comment';

export class CommentData extends JsonData<Comment> {
  static readonly TYPE = 'comment';

  constructor(doc: RealtimeDoc, store: RealtimeOfflineStore) {
    super(CommentData.TYPE, doc, store);
  }
}
