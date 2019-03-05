import Coordinator from '@orbit/coordinator';
import { buildTransform, pullable, Query, Record, RecordOperation, Schema, Source, Transform } from '@orbit/data';

import { getRequestType, RequestType } from '../request-type';
import { XForgeStore } from '../store/xforge-store';
import { TEST_SCHEMA_SETTINGS } from '../test-schema-settings';
import { RemoteStoreSyncStrategy } from './remote-store-sync-strategy';
import { StoreRemoteQueryStrategy } from './store-remote-query-strategy';

describe('RemoteStoreSyncStrategy', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
    return env.init();
  });
  afterEach(() => env.dispose());

  it('online', async () => {
    const users: Record[] = await env.store.query(q => q.findRecords('user'), {
      requestType: RequestType.OnlineOnly
    });
    expect(users.map(u => u.id).sort()).toEqual(['user01', 'user03', 'user04']);
  });

  it('offline', async done => {
    const initialUsers: Record[] = await env.store.query(q => q.findRecords('user'), {
      requestType: RequestType.OfflineFirst
    });
    expect(initialUsers.map(u => u.id).sort()).toEqual(['user01', 'user02', 'user03']);
    env.store.syncQueue.one('complete', () => {
      const updatedUsers: Record[] = env.store.cache.query(q => q.findRecords('user'));
      expect(updatedUsers.map(u => u.id).sort()).toEqual(['user01', 'user03', 'user04']);
      done();
    });
  });
});

@pullable
class TestSource extends Source {
  _pull(query: Query): Promise<Transform[]> {
    const ops: RecordOperation[] = [
      { op: 'replaceRecord', record: { type: 'user', id: 'user01', attributes: { name: 'User 1' } } },
      { op: 'replaceRecord', record: { type: 'user', id: 'user03', attributes: { name: 'User 3' } } },
      { op: 'replaceRecord', record: { type: 'user', id: 'user04', attributes: { name: 'User 4' } } }
    ];
    return Promise.resolve([buildTransform(ops, { requestType: getRequestType(query) })]);
  }
}

class TestEnvironment {
  readonly schema: Schema;
  readonly remote: TestSource;
  readonly store: XForgeStore;

  readonly coordinator: Coordinator;

  constructor() {
    this.schema = new Schema(TEST_SCHEMA_SETTINGS);
    this.remote = new TestSource({ name: 'remote' });
    this.store = new XForgeStore({
      name: 'store',
      schema: this.schema
    });
    this.store.cache.patch(t => [
      t.addRecord({ type: 'user', id: 'user01', attributes: { name: 'User 1' } }),
      t.addRecord({ type: 'user', id: 'user02', attributes: { name: 'User 2' } }),
      t.addRecord({ type: 'user', id: 'user03', attributes: { name: 'User 3' } })
    ]);

    this.coordinator = new Coordinator({
      sources: [this.remote, this.store],
      strategies: [new StoreRemoteQueryStrategy('store', 'remote'), new RemoteStoreSyncStrategy('remote', 'store')]
    });
  }

  init(): Promise<void> {
    return this.coordinator.activate();
  }

  dispose(): Promise<void> {
    return this.coordinator.deactivate();
  }
}
