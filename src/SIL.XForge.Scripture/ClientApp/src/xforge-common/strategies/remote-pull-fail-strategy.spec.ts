import Coordinator from '@orbit/coordinator';
import { ClientError, pullable, Query, Schema, Source, Transform } from '@orbit/data';

import { RequestType } from '../request-type';
import { XForgeStore } from '../store/xforge-store';
import { TEST_SCHEMA_SETTINGS } from '../test-schema-settings';
import { RemotePullFailStrategy } from './remote-pull-fail-strategy';
import { StoreRemoteQueryStrategy } from './store-remote-query-strategy';

describe('RemotePullFailStrategy', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
    return env.init();
  });
  afterEach(() => env.dispose());

  describe('online', () => {
    it('not found error - removed from cache', async () => {
      env.setupNotFoundError();

      let user = await env.store.query(q => q.findRecord({ type: 'user', id: 'user01' }), {
        requestType: RequestType.OnlineOnly
      });
      expect(user).toBeNull();
      user = env.store.cache.query(q => q.findRecord({ type: 'user', id: 'user01' }));
      expect(user).toBeNull();

      expect(env.store.requestQueue.empty).toBe(true);
      expect(env.remote.requestQueue.empty).toBe(true);
    });

    it('general error - cache not changed', async () => {
      env.setupGeneralError();

      let err: any;
      try {
        await env.store.query(q => q.findRecord({ type: 'user', id: 'user01' }), {
          requestType: RequestType.OnlineOnly
        });
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      const user = env.store.cache.query(q => q.findRecord({ type: 'user', id: 'user01' }));
      expect(user).not.toBeNull();

      expect(env.store.requestQueue.empty).toBe(true);
      expect(env.remote.requestQueue.empty).toBe(true);
    });
  });

  describe('offline', () => {
    it('not found error - removed from cache', async done => {
      env.setupNotFoundError();

      const initialUser = await env.store.query(q => q.findRecord({ type: 'user', id: 'user01' }), {
        requestType: RequestType.OfflineFirst
      });
      expect(initialUser).not.toBeNull();

      env.store.requestQueue.one('complete', () => {
        const updatedUser = env.store.cache.query(q => q.findRecord({ type: 'user', id: 'user01' }));
        expect(updatedUser).toBeNull();

        expect(env.store.requestQueue.empty).toBe(true);
        expect(env.remote.requestQueue.empty).toBe(true);
        done();
      });
    });

    it('general error - cache not changed', async () => {
      env.setupGeneralError();

      const user = await env.store.query(q => q.findRecord({ type: 'user', id: 'user01' }), {
        requestType: RequestType.OfflineFirst
      });
      expect(user).not.toBeNull();

      expect(env.store.requestQueue.empty).toBe(true);
      expect(env.remote.requestQueue.empty).toBe(true);
    });
  });
});

@pullable
class TestSource extends Source {
  _pull: (query: Query) => Promise<Transform[]>;
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
      t.addRecord({ type: 'user', id: 'user02', attributes: { name: 'User 2' } })
    ]);

    this.coordinator = new Coordinator({
      sources: [this.remote, this.store],
      strategies: [new RemotePullFailStrategy('remote', 'store'), new StoreRemoteQueryStrategy('store', 'remote')]
    });
  }

  init(): Promise<void> {
    return this.coordinator.activate();
  }

  setupNotFoundError(): void {
    this.remote._pull = () => {
      const err: any = new ClientError('Not found');
      err.response = { status: 404 };
      throw err;
    };
  }

  setupGeneralError(): void {
    this.remote._pull = () => {
      throw new Error('General error.');
    };
  }

  dispose(): Promise<void> {
    return this.coordinator.deactivate();
  }
}
