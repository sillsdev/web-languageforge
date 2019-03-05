import { ConnectionStrategy } from '@orbit/coordinator';
import { buildTransform, Query, Record, RemoveRecordOperation, ReplaceRecordOperation, Transform } from '@orbit/data';
import Store from '@orbit/store';

import { isOnlineRequest } from '../request-type';

/**
 * This strategy syncs any changes received from the remote source to the memory store. When it receives the results of
 * a "findRecords" query, it will check if any records have been removed and purge them from the memory store.
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
      // Purge deleted records from the cache when performing a findRecords query
      const query = task.data as Query;
      if (query.expression.op === 'findRecords') {
        const cachedResources: Record[] = store.cache.query(query);
        if (cachedResources.length > 0) {
          const remoteResourceIds = new Set<string>(
            transform.operations.map(op => (op as ReplaceRecordOperation).record.id)
          );

          const deletedResources: Record[] = [];
          for (const cachedResource of cachedResources) {
            if (!remoteResourceIds.has(cachedResource.id)) {
              deletedResources.push(cachedResource);
            }
          }

          if (deletedResources.length > 0) {
            const operations = transform.operations.slice();
            for (const resource of deletedResources) {
              operations.push({
                op: 'removeRecord',
                record: { type: resource.type, id: resource.id }
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
