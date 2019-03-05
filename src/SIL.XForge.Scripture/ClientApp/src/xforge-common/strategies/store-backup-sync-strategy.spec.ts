import Coordinator from '@orbit/coordinator';
import { Record, RemoveRecordOperation, Schema, Source, syncable, Transform } from '@orbit/data';

import { RequestType } from '../request-type';
import { XForgeStore } from '../store/xforge-store';
import { TEST_SCHEMA_SETTINGS } from '../test-schema-settings';
import { StoreBackupSyncStrategy } from './store-backup-sync-strategy';

describe('StoreBackupSyncStrategy', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
    return env.init();
  });
  afterEach(() => env.dispose());

  it('remove record with dependencies', async () => {
    env.expectBackupSync(transform => {
      expect(transform.operations.length).toBe(3);
      expect(transform.operations.every(o => o.op === 'removeRecord')).toBe(true);
      expect(transform.operations.map(o => (o as RemoveRecordOperation).record.id).sort()).toEqual([
        'projectuser01',
        'projectuser02',
        'user01'
      ]);
    });
    await env.store.update(t => t.removeRecord({ type: 'user', id: 'user01' }), {
      requestType: RequestType.OfflineFirst
    });
    const user: Record = env.store.cache.query(q => q.findRecord({ type: 'user', id: 'user01' }));
    expect(user).toBeNull();
    const projectUsers: Record[] = env.store.cache.query(q => q.findRecords('projectUser'));
    expect(projectUsers.map(pu => pu.id)).toEqual(['projectuser03', 'projectuser04']);
    expect(env.backupSyncCalled).toBe(true);
  });

  it('online persist', async () => {
    env.expectBackupSync(transform => {
      expect(transform.operations.length).toBe(1);
      expect(transform.operations[0].op).toBe('removeRecord');
      expect((transform.operations[0] as RemoveRecordOperation).record.id).toBe('projectuser01');
    });
    await env.store.update(t => t.removeRecord({ type: 'projectUser', id: 'projectuser01' }), {
      requestType: RequestType.OnlinePersist
    });
    const projectUsers: Record[] = env.store.cache.query(q => q.findRecords('projectUser'));
    expect(projectUsers.map(pu => pu.id)).toEqual(['projectuser02', 'projectuser03', 'projectuser04']);
    expect(env.backupSyncCalled).toBe(true);
  });

  it('online only', async () => {
    env.expectBackupSync();
    await env.store.update(t => t.removeRecord({ type: 'projectUser', id: 'projectuser01' }), {
      requestType: RequestType.OnlineOnly
    });
    const projectUsers: Record[] = env.store.cache.query(q => q.findRecords('projectUser'));
    expect(projectUsers.map(pu => pu.id)).toEqual(['projectuser02', 'projectuser03', 'projectuser04']);
    expect(env.backupSyncCalled).toBe(false);
  });
});

@syncable
class TestSource extends Source {
  _sync: (_transform: Transform) => Promise<Transform[]>;
}

class TestEnvironment {
  readonly schema: Schema;
  readonly backup: TestSource;
  readonly store: XForgeStore;

  readonly coordinator: Coordinator;

  backupSyncCalled: boolean = false;

  constructor() {
    this.schema = new Schema(TEST_SCHEMA_SETTINGS);
    this.backup = new TestSource({ name: 'backup' });
    this.store = new XForgeStore({
      name: 'store',
      schema: this.schema
    });
    this.store.cache.patch(t => [
      t.addRecord({ type: 'user', id: 'user01', attributes: { name: 'User 1' } }),
      t.addRecord({ type: 'user', id: 'user02', attributes: { name: 'User 2' } }),
      t.addRecord({ type: 'project', id: 'project01', attributes: { projectName: 'Project 1' } }),
      t.addRecord({ type: 'project', id: 'project02', attributes: { projectName: 'Project 2' } }),
      t.addRecord({ type: 'project', id: 'project03', attributes: { projectName: 'Project 3' } }),
      t.addRecord({
        type: 'projectUser',
        id: 'projectuser01',
        attributes: { role: 'admin' },
        relationships: {
          user: { data: { type: 'user', id: 'user01' } },
          project: { data: { type: 'project', id: 'project01' } }
        }
      }),
      t.addRecord({
        type: 'projectUser',
        id: 'projectuser02',
        attributes: { role: 'admin' },
        relationships: {
          user: { data: { type: 'user', id: 'user01' } },
          project: { data: { type: 'project', id: 'project02' } }
        }
      }),
      t.addRecord({
        type: 'projectUser',
        id: 'projectuser03',
        attributes: { role: 'user' },
        relationships: {
          user: { data: { type: 'user', id: 'user02' } },
          project: { data: { type: 'project', id: 'project02' } }
        }
      }),
      t.addRecord({
        type: 'projectUser',
        id: 'projectuser04',
        attributes: { role: 'admin' },
        relationships: {
          user: { data: { type: 'user', id: 'user02' } },
          project: { data: { type: 'project', id: 'project03' } }
        }
      })
    ]);

    this.coordinator = new Coordinator({
      sources: [this.backup, this.store],
      strategies: [new StoreBackupSyncStrategy('store', 'backup')]
    });
  }

  init(): Promise<void> {
    return this.coordinator.activate();
  }

  expectBackupSync(checkExpectations?: (transform: Transform) => void): void {
    this.backupSyncCalled = false;
    this.backup._sync = transform => {
      if (checkExpectations != null) {
        checkExpectations(transform);
      }
      this.backupSyncCalled = true;
      return Promise.resolve([]);
    };
  }

  dispose(): Promise<void> {
    return this.coordinator.deactivate();
  }
}
