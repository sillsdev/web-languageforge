import { ConnectionStrategy } from '@orbit/coordinator';
import { buildTransform, Query, Record, RemoveRecordOperation, ReplaceRecordOperation, Transform } from '@orbit/data';
import Store from '@orbit/store';

import { isOnlineRequest } from '../request-type';

/**
 * This strategy syncs any changes received from the remote source to the memory store. When it receives the results of
 * a "findRecords" or "findRelatedRecords" query, it will check if any records have been removed and purge them from the
 * memory store.
 */
export class RemoteStoreSyncStrategy extends ConnectionStrategy {
  constructor(remote: string, store: string) {
    super({
      source: remote,
      on: 'transform',

      target: store,
      action: (transform: Transform) => this.sync(transform),

      blocking: (transform: Transform) => isOnlineRequest(transform)
    });
  }

  private sync(transform: Transform): Promise<void> {
    const store = this.target as Store;
    const task = this.source.requestQueue.currentProcessor.task;
    if (task.type === 'pull') {
      // Purge deleted records from the cache when performing a "findRecords" or "findRelatedRecords" query.
      // Potential issues:
      // 1. if filtering or paging is specified on a "findRecords" query, records that no longer match the query but
      // still exist could be incorrectly deleted.
      // 2. a record that still exists but is no longer related to the record specified in the "findRelatedRecords"
      // query could be incorrectly deleted.
      //
      // Although these issues could occur, it is preferable that we ensure that deleted records are purged from the
      // memory store. If records are incorrectly deleted, they will still be retrieved from the server when needed.
      const query = task.data as Query;
      if (query.expression.op === 'findRecords' || query.expression.op === 'findRelatedRecords') {
        const cachedRecords: Record[] = store.cache.query(query);
        if (cachedRecords.length > 0) {
          const remoteRecordIds = new Set<string>(
            transform.operations.map(op => (op as ReplaceRecordOperation).record.id)
          );

          const deletedRecords: Record[] = [];
          for (const cachedRecord of cachedRecords) {
            if (!remoteRecordIds.has(cachedRecord.id)) {
              deletedRecords.push(cachedRecord);
            }
          }

          if (deletedRecords.length > 0) {
            const operations = transform.operations.slice();
            for (const deletedRecord of deletedRecords) {
              operations.push({
                op: 'removeRecord',
                record: { type: deletedRecord.type, id: deletedRecord.id }
              } as RemoveRecordOperation);
            }
            transform = buildTransform(operations, transform.options, transform.id);
          }
        }
      }
    }
    return store.sync(transform);
  }
}
