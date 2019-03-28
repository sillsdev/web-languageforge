import Coordinator from '@orbit/coordinator';
import { pullable, Query, Schema, Source, Transform } from '@orbit/data';

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

  it('error', async () => {
    env.setupGeneralError();

    let err: any;
    try {
      await env.store.query(q => q.findRecord({ type: 'user', id: 'user01' }));
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();

    expect(env.remote.requestQueue.empty).toBe(true);
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
      strategies: [new RemotePullFailStrategy('remote'), new StoreRemoteQueryStrategy('store', 'remote')]
    });
  }

  init(): Promise<void> {
    return this.coordinator.activate();
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
