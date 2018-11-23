import { ConnectionStrategy } from '@orbit/coordinator';
import { Operation, Query, Record, ReplaceRecordOperation, Transform } from '@orbit/data';
import Store from '@orbit/store';

export class RemotePullStorePurgeStrategy extends ConnectionStrategy {
  constructor(remote: string, store: string) {
    super({
      source: remote,
      on: 'pull',

      target: store,

      action: (q: Query, t: Transform[]) => this.handlePull(q, t),
      filter: (q: Query) => q.expression.op === 'findRecords'
    });
  }

  private handlePull(query: Query, transforms: Transform[]): void {
    // Purge deleted records from the cache when performing a findRecords query
    const store = this.target as Store;
    const cachedResources: Record[] = store.cache.query(query);
    if (cachedResources.length === 0) {
      return;
    }

    const transform = transforms[0];
    const remoteResourceIds = new Set<string>(transform.operations.map(op => (op as ReplaceRecordOperation).record.id));

    const deletedResources: Record[] = [];
    for (const cachedResource of cachedResources) {
      if (!remoteResourceIds.has(cachedResource.id)) {
        deletedResources.push(cachedResource);
      }
    }

    if (deletedResources.length > 0) {
      store.update(t => {
        const ops: Operation[] = [];
        for (const resource of deletedResources) {
          ops.push(t.removeRecord(resource));
        }
        return ops;
      }, { localOnly: true });
    }
  }
}
