import Coordinator from '@orbit/coordinator';
import { NetworkError, pushable, Record, Schema, Source, Transform } from '@orbit/data';

import { RequestType } from '../request-type';
import { XForgeStore } from '../store/xforge-store';
import { TEST_SCHEMA_SETTINGS } from '../test-schema-settings';
import { RemotePushFailStrategy } from './remote-push-fail-strategy';
import { StoreRemoteUpdateStrategy } from './store-remote-update-strategy';

describe('RemotePullFailStrategy', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
    return env.init();
  });
  afterEach(() => env.dispose());

  describe('offline', () => {
    it('network error', async done => {
      env.setupNetworkError();

      await env.store.update(t => t.replaceAttribute({ type: 'user', id: 'user01' }, 'name', 'User 1a'), {
        requestType: RequestType.OfflineFirst
      });

      const user: Record = env.store.cache.query(q => q.findRecord({ type: 'user', id: 'user01' }));
      expect(user.attributes.name).toBe('User 1a');

      expect(env.store.requestQueue.empty).toBeTruthy();
      expect(env.remote.requestQueue.empty).toBeFalsy();

      // wait for retry
      jasmine.clock().tick(10);

      env.remote.requestQueue.one('complete', () => {
        expect(env.remote.requestQueue.empty).toBeTruthy();
        done();
      });
    });

    it('general error', async () => {
      env.setupGeneralError();

      await env.store.update(t => t.replaceAttribute({ type: 'user', id: 'user01' }, 'name', 'User 1a'), {
        requestType: RequestType.OfflineFirst
      });

      const user: Record = env.store.cache.query(q => q.findRecord({ type: 'user', id: 'user01' }));
      expect(user.attributes.name).toBe('User 1');

      expect(env.store.requestQueue.empty).toBeTruthy();
      expect(env.remote.requestQueue.empty).toBeTruthy();
    });
  });

  describe('online', () => {
    it('network error', async () => {
      env.setupNetworkError();

      let err: any;
      try {
        await env.store.update(t => t.replaceAttribute({ type: 'user', id: 'user01' }, 'name', 'User 1a'), {
          requestType: RequestType.OnlineOnly
        });
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();

      const user: Record = env.store.cache.query(q => q.findRecord({ type: 'user', id: 'user01' }));
      expect(user.attributes.name).toBe('User 1');

      expect(env.store.requestQueue.empty).toBeTruthy();
      expect(env.remote.requestQueue.empty).toBeTruthy();
    });

    it('general error', async () => {
      env.setupGeneralError();

      let err: any;
      try {
        await env.store.update(t => t.replaceAttribute({ type: 'user', id: 'user01' }, 'name', 'User 1a'), {
          requestType: RequestType.OnlineOnly
        });
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();

      const user: Record = env.store.cache.query(q => q.findRecord({ type: 'user', id: 'user01' }));
      expect(user.attributes.name).toBe('User 1');

      expect(env.store.requestQueue.empty).toBeTruthy();
      expect(env.remote.requestQueue.empty).toBeTruthy();
    });
  });
});

@pushable
class TestSource extends Source {
  _push: (transform: Transform) => Promise<Transform[]>;
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
      strategies: [new RemotePushFailStrategy('remote', 'store', 10), new StoreRemoteUpdateStrategy('store', 'remote')]
    });
  }

  init(): Promise<void> {
    jasmine.clock().install();
    return this.coordinator.activate();
  }

  setupNetworkError(): void {
    this.remote._push = () => {
      this.setupNoError();
      throw new NetworkError('The network is offline.');
    };
  }

  setupGeneralError(): void {
    this.remote._push = () => {
      throw new Error('General error.');
    };
  }

  setupNoError(): void {
    this.remote._push = () => Promise.resolve([]);
  }

  dispose(): Promise<void> {
    jasmine.clock().uninstall();
    return this.coordinator.deactivate();
  }
}
