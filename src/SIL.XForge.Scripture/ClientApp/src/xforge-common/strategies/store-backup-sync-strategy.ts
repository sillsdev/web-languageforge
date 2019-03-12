import Coordinator, { ActivationOptions, ConnectionStrategy } from '@orbit/coordinator';
import {
  buildTransform,
  equalRecordIdentities,
  RecordOperation,
  RemoveRecordOperation,
  Source,
  Syncable,
  Transform
} from '@orbit/data';
import Store from '@orbit/store';

import { isPersistRequest } from '../request-type';

/**
 * This strategy syncs the memory cache with a persistent backup. A normal sync strategy cannot be used, because it
 * passes along the transform that the cache receives in its sync call. This transform does not include the removal of
 * dependent records. In order to deal with this side-effect, this strategy collects all remove operations executed on
 * the cache by listening to the "patch" event, and then creating a new transform that includes the extra remove
 * operations.
 */
export class StoreBackupSyncStrategy extends ConnectionStrategy {
  private removeOperations: RemoveRecordOperation[] = [];

  constructor(store: string, backup: string) {
    super({
      source: store,
      on: 'transform',

      target: backup,
      filter: (transform: Transform) => isPersistRequest(transform),
      action: (transform: Transform) => this.handleTransform(transform),

      blocking: true
    });
  }

  async activate(coordinator: Coordinator, options: ActivationOptions = {}): Promise<any> {
    await super.activate(coordinator, options);
    (this.source as Store).cache.on('patch', this.sync);
  }

  async deactivate(): Promise<any> {
    await super.deactivate();
    (this.source as Store).cache.off('patch', this.sync);
  }

  private handleTransform(transform: Transform): Promise<void> {
    if (this.removeOperations.length > 0) {
      const operations = transform.operations.slice();
      for (const removeOperation of this.removeOperations) {
        let add = true;
        for (const transformOperation of transform.operations) {
          if (transformOperation.op !== 'removeRecord') {
            continue;
          }

          const transformRemoveOperation = transformOperation as RemoveRecordOperation;
          if (equalRecordIdentities(removeOperation.record, transformRemoveOperation.record)) {
            add = false;
            break;
          }
        }
        if (add) {
          operations.push(removeOperation);
        }
      }
      transform = buildTransform(operations, transform.options, transform.id);
      this.removeOperations = [];
    }
    return (this.target as Source & Syncable).sync(transform);
  }

  private sync = (operation: RecordOperation) => {
    if (operation.op === 'removeRecord') {
      this.removeOperations.push(operation);
    }
  };
}
