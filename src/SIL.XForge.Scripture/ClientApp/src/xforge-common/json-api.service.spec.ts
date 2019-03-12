import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { Query, Schema, Transform } from '@orbit/data';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { instance, mock, when } from 'ts-mockito';

import { JsonApiService } from './json-api.service';
import { JsonRpcService } from './json-rpc.service';
import { DomainModel } from './models/domain-model';
import { Project, ProjectRef } from './models/project';
import { ProjectUser, ProjectUserRef } from './models/project-user';
import { User } from './models/user';
import { OrbitService } from './orbit-service';
import { RequestType } from './request-type';
import { XForgeStore } from './store/xforge-store';
import { SubscriptionDisposable } from './subscription-disposable';
import { TEST_SCHEMA_SETTINGS } from './test-schema-settings';
import { nameof } from './utils';

describe('JsonApiService', () => {
  let env: TestEnvironment;

  beforeEach(() => (env = new TestEnvironment()));
  afterEach(() => env.dispose());

  describe('get', () => {
    it('with no include', async(async () => {
      env.expectQueryRequestType(RequestType.OfflineFirst);
      env.expectObservable(
        env.service.get<User>({ type: User.TYPE, id: 'user01' }),
        (r, e) => expect(r.data == null ? null : r.data.name).toBe(e),
        'User 1',
        'User 1a',
        null
      );
      // update the user
      await env.store.update(t =>
        t.replaceAttribute({ type: User.TYPE, id: 'user01' }, nameof<User>('name'), 'User 1a')
      );
      // update a different user
      await env.store.update(t =>
        t.replaceAttribute({ type: User.TYPE, id: 'user02' }, nameof<User>('name'), 'User 2a')
      );
      // update a different type of resource
      await env.store.update(t =>
        t.replaceAttribute(
          { type: TestProject.TYPE, id: 'project01' },
          nameof<TestProject>('projectName'),
          'Project 1a'
        )
      );
      // remove the user
      await env.store.update(t => t.removeRecord({ type: User.TYPE, id: 'user01' }));
    }));

    it('with include', async(async () => {
      env.expectQueryRequestType(RequestType.OfflineFirst);
      env.expectObservable(
        env.service.get<User>({ type: User.TYPE, id: 'user01' }, [[nameof<User>('projects')]]),
        (r, e) => expect(r.getManyIncluded<TestProjectUser>(r.data.projects).map(pu => pu.name)).toEqual(e),
        ['Project User 1', 'Project User 2'],
        ['Project User 1', 'Project User 2'],
        ['Project User 1a', 'Project User 2'],
        ['Project User 2']
      );
      // update the user
      await env.store.update(t =>
        t.replaceAttribute({ type: User.TYPE, id: 'user01' }, nameof<User>('name'), 'User 1a')
      );
      // update a project user
      await env.store.update(t =>
        t.replaceAttribute(
          { type: TestProjectUser.TYPE, id: 'projectuser01' },
          nameof<TestProjectUser>('name'),
          'Project User 1a'
        )
      );
      // update a different type of resource
      await env.store.update(t =>
        t.replaceAttribute(
          { type: TestProject.TYPE, id: 'project01' },
          nameof<TestProject>('projectName'),
          'Project 1a'
        )
      );
      // remove a project user
      await env.store.update(t => t.removeRecord({ type: TestProjectUser.TYPE, id: 'projectuser01' }));
    }));
  });

  it('getRelated', async(async () => {
    env.expectQueryRequestType(RequestType.OfflineFirst);
    env.expectObservable(
      env.service.getRelated<User>(
        { type: TestProjectUser.TYPE, id: 'projectuser01' },
        nameof<TestProjectUser>('user')
      ),
      (r, e) => expect(r.data == null ? null : r.data.name).toBe(e),
      'User 1',
      'User 1a',
      null
    );
    // update the user
    await env.store.update(t => t.replaceAttribute({ type: User.TYPE, id: 'user01' }, nameof<User>('name'), 'User 1a'));
    // update a different user
    await env.store.update(t => t.replaceAttribute({ type: User.TYPE, id: 'user02' }, nameof<User>('name'), 'User 2a'));
    // update a different type of resource
    await env.store.update(t =>
      t.replaceAttribute({ type: TestProject.TYPE, id: 'project01' }, nameof<TestProject>('projectName'), 'Project 1a')
    );
    // update the project user
    await env.store.update(t =>
      t.replaceAttribute({ type: TestProjectUser.TYPE, id: 'projectuser01' }, nameof<TestProjectUser>('role'), 'user')
    );
    // remove the user
    await env.store.update(t => t.removeRecord({ type: User.TYPE, id: 'user01' }));
  }));

  describe('getAll', () => {
    it('with no parameters', async(async () => {
      env.expectQueryRequestType(RequestType.OfflineFirst);
      env.expectObservable(
        env.service.getAll<TestProject>(TestProject.TYPE),
        (r, e) => expect(r.data.map(p => p.projectName).sort()).toEqual(e),
        ['Project 1', 'Project 2', 'Project 3'],
        ['Project 1', 'Project 2a', 'Project 3'],
        ['Project 1', 'Project 3']
      );
      // update a project
      await env.store.update(t =>
        t.replaceAttribute(
          { type: TestProject.TYPE, id: 'project02' },
          nameof<TestProject>('projectName'),
          'Project 2a'
        )
      );
      // update a different type of resource
      await env.store.update(t =>
        t.replaceAttribute({ type: User.TYPE, id: 'user01' }, nameof<User>('name'), 'User 1a')
      );
      // remove a project
      await env.store.update(t => t.removeRecord({ type: TestProject.TYPE, id: 'project02' }));
    }));

    it('with filtering', async(async () => {
      env.expectQueryRequestType(RequestType.OfflineFirst);
      env.expectObservable(
        env.service.getAll<TestProject>(TestProject.TYPE, {
          filters: [{ op: 'gte', name: nameof<TestProject>('num'), value: 2 }]
        }),
        (r, e) => expect(r.data.map(p => p.projectName).sort()).toEqual(e),
        ['Project 2', 'Project 3']
      );
    }));

    it('with sorting', async(async () => {
      env.expectQueryRequestType(RequestType.OfflineFirst);
      env.expectObservable(
        env.service.getAll<TestProject>(TestProject.TYPE, { sort: [{ name: 'num', order: 'descending' }] }),
        (r, e) => expect(r.data.map(p => p.projectName)).toEqual(e),
        ['Project 3', 'Project 2', 'Project 1']
      );
    }));

    it('with pagination', async(async () => {
      env.expectQueryRequestType(RequestType.OfflineFirst);
      env.expectObservable(
        env.service.getAll<TestProject>(TestProject.TYPE, {
          sort: [{ name: 'num', order: 'ascending' }],
          pagination: { index: 0, size: 2 }
        }),
        (r, e) => expect(r.data.map(p => p.projectName)).toEqual(e),
        ['Project 1', 'Project 2']
      );
    }));
  });

  it('getAllRelated', async(async () => {
    env.expectQueryRequestType(RequestType.OfflineFirst);
    env.expectObservable(
      env.service.getAllRelated<TestProjectUser>({ type: User.TYPE, id: 'user01' }, nameof<User>('projects')),
      (r, e) => expect(r.data.map(pu => pu.name).sort()).toEqual(e),
      ['Project User 1', 'Project User 2'],
      ['Project User 1a', 'Project User 2'],
      ['Project User 2']
    );
    // update a project user
    await env.store.update(t =>
      t.replaceAttribute(
        { type: TestProjectUser.TYPE, id: 'projectuser01' },
        nameof<TestProjectUser>('name'),
        'Project User 1a'
      )
    );
    // update a different type of resource
    await env.store.update(t =>
      t.replaceAttribute({ type: TestProject.TYPE, id: 'project01' }, nameof<TestProject>('projectName'), 'Project 1a')
    );
    // update the user
    await env.store.update(t => t.replaceAttribute({ type: User.TYPE, id: 'user01' }, nameof<User>('name'), 'User 1a'));
    // remove a project user
    await env.store.update(t => t.removeRecord({ type: TestProjectUser.TYPE, id: 'projectuser01' }));
  }));

  it('create', async(async () => {
    env.expectUpdateRequestType(RequestType.OfflineFirst);
    env.expectObservable(
      env.service.getAll<User>(User.TYPE),
      (r, e) => expect(r.data.map(p => p.name).sort()).toEqual(e),
      ['User 1', 'User 2'],
      ['User 1', 'User 2', 'User 3']
    );

    const user = await env.service.create(new User({ name: 'User 3' }));
    expect(user.id).toBeDefined();
  }));

  it('update', async(async () => {
    env.expectUpdateRequestType(RequestType.OfflineFirst);
    const user = await env.service
      .get<User>({ type: User.TYPE, id: 'user01' })
      .pipe(
        map(r => r.data),
        first()
      )
      .toPromise();

    env.expectObservable(
      env.service.get<User>({ type: User.TYPE, id: 'user01' }),
      (r, e) => {
        expect(r.data.name).toBe(e.name);
        expect(r.data.site).toEqual(e.site);
      },
      { name: 'User 1', site: { currentProjectId: 'project01' } },
      { name: 'User 1a', site: { currentProjectId: 'project01' } },
      { name: 'User 1a', site: { currentProjectId: 'project02' } }
    );

    // update a string
    user.name = 'User 1a';
    await env.service.update(user);

    // no change
    user.site = { currentProjectId: 'project01' };
    await env.service.update(user);

    // update an object
    user.site = { currentProjectId: 'project02' };
    await env.service.update(user);
  }));

  it('updateAttributes', async(async () => {
    env.expectUpdateRequestType(RequestType.OfflineFirst);
    env.expectObservable(
      env.service.get<User>({ type: User.TYPE, id: 'user01' }),
      (r, e) => {
        expect(r.data.name).toBe(e.name);
        expect(r.data.site).toEqual(e.site);
      },
      { name: 'User 1', site: { currentProjectId: 'project01' } },
      { name: 'User 1a', site: { currentProjectId: 'project01' } },
      { name: 'User 1a', site: { currentProjectId: 'project02' } },
      { name: 'User 1b', site: { currentProjectId: 'project03' } }
    );

    // update a string attribute
    let user = await env.service.updateAttributes<User>({ type: User.TYPE, id: 'user01' }, { name: 'User 1a' });
    expect(user.name).toBe('User 1a');

    // update an object attribute
    user = await env.service.updateAttributes<User>(
      { type: User.TYPE, id: 'user01' },
      { site: { currentProjectId: 'project02' } }
    );
    expect(user.site).toEqual({ currentProjectId: 'project02' });

    // update multiple attributes
    user = await env.service.updateAttributes<User>(
      { type: User.TYPE, id: 'user01' },
      { name: 'User 1b', site: { currentProjectId: 'project03' } }
    );
    expect(user.name).toBe('User 1b');
    expect(user.site).toEqual({ currentProjectId: 'project03' });
  }));

  it('delete', async(async () => {
    env.expectUpdateRequestType(RequestType.OfflineFirst);
    env.expectObservable(
      env.service.get<User>({ type: User.TYPE, id: 'user01' }),
      (r, e) => expect(r.data == null ? null : r.data.id).toBe(e),
      'user01',
      null
    );

    env.expectObservable(
      env.service.getAll<TestProjectUser>(TestProjectUser.TYPE),
      (r, e) => expect(r.data.map(pu => pu.id).sort()).toEqual(e),
      ['projectuser01', 'projectuser02', 'projectuser03', 'projectuser04'],
      ['projectuser03', 'projectuser04']
    );

    await env.service.delete({ type: User.TYPE, id: 'user01' });
  }));

  describe('onlineGet', () => {
    it('with no include', async(async () => {
      env.expectQueryRequestType(RequestType.OnlineOnly);
      env.expectObservable(
        env.service.onlineGet<User>({ type: User.TYPE, id: 'user01' }),
        (r, e) => expect(r.data == null ? null : r.data.name).toBe(e),
        'User 1'
      );
    }));

    it('with include', async(async () => {
      env.expectQueryRequestType(RequestType.OnlineOnly);
      env.expectObservable(
        env.service.onlineGet<User>({ type: User.TYPE, id: 'user01' }, [[nameof<User>('projects')]]),
        (r, e) => expect(r.getManyIncluded<TestProjectUser>(r.data.projects).map(pu => pu.name)).toEqual(e),
        ['Project User 1', 'Project User 2']
      );
    }));
  });

  it('onlineGetRelated', async(async () => {
    env.expectQueryRequestType(RequestType.OnlineOnly);
    env.expectObservable(
      env.service.onlineGetRelated<User>(
        { type: TestProjectUser.TYPE, id: 'projectuser01' },
        nameof<TestProjectUser>('user')
      ),
      (r, e) => expect(r.data == null ? null : r.data.name).toBe(e),
      'User 1'
    );
  }));

  describe('onlineGetAll', () => {
    it('with no parameters', async(async () => {
      env.expectQueryRequestType(RequestType.OnlineOnly);
      env.expectObservable(
        env.service.onlineGetAll<TestProject>(TestProject.TYPE),
        (r, e) => expect(r.data.map(p => p.projectName).sort()).toEqual(e),
        ['Project 1', 'Project 2', 'Project 3']
      );
    }));

    it('with filtering', async(async () => {
      env.expectQueryRequestType(RequestType.OnlineOnly);
      env.expectObservable(
        env.service.onlineGetAll<TestProject>(TestProject.TYPE, {
          filters: [{ op: 'gte', name: nameof<TestProject>('num'), value: 2 }]
        }),
        (r, e) => expect(r.data.map(p => p.projectName).sort()).toEqual(e),
        ['Project 2', 'Project 3']
      );
    }));

    it('with sorting', async(async () => {
      env.expectQueryRequestType(RequestType.OnlineOnly);
      env.expectObservable(
        env.service.onlineGetAll<TestProject>(TestProject.TYPE, { sort: [{ name: 'num', order: 'descending' }] }),
        (r, e) => expect(r.data.map(p => p.projectName)).toEqual(e),
        ['Project 3', 'Project 2', 'Project 1']
      );
    }));

    it('with pagination', async(async () => {
      env.expectQueryRequestType(RequestType.OnlineOnly);
      env.expectObservable(
        env.service.onlineGetAll<TestProject>(TestProject.TYPE, {
          sort: [{ name: 'num', order: 'ascending' }],
          pagination: { index: 0, size: 2 }
        }),
        (r, e) => expect(r.data.map(p => p.projectName)).toEqual(e),
        ['Project 1', 'Project 2']
      );
    }));
  });

  it('onlineGetAllRelated', async(async () => {
    env.expectQueryRequestType(RequestType.OnlineOnly);
    env.expectObservable(
      env.service.onlineGetAllRelated<TestProjectUser>({ type: User.TYPE, id: 'user01' }, nameof<User>('projects')),
      (r, e) => expect(r.data.map(pu => pu.name).sort()).toEqual(e),
      ['Project User 1', 'Project User 2']
    );
  }));

  it('onlineCreate', async(async () => {
    env.expectUpdateRequestType(RequestType.OnlineOnly);
    env.expectObservable(
      env.service.getAll<User>(User.TYPE),
      (r, e) => expect(r.data.map(p => p.name).sort()).toEqual(e),
      ['User 1', 'User 2'],
      ['User 1', 'User 2', 'User 3']
    );

    const user = await env.service.onlineCreate(new User({ name: 'User 3' }));
    expect(user.id).toBeDefined();
  }));

  describe('onlineUpdateAttributes', () => {
    it('OnlineOnly', async(async () => {
      env.expectUpdateRequestType(RequestType.OnlineOnly);
      env.expectObservable(
        env.service.get<User>({ type: User.TYPE, id: 'user01' }),
        (r, e) => {
          expect(r.data.name).toBe(e.name);
          expect(r.data.site).toEqual(e.site);
        },
        { name: 'User 1', site: { currentProjectId: 'project01' } },
        { name: 'User 1a', site: { currentProjectId: 'project01' } },
        { name: 'User 1a', site: { currentProjectId: 'project02' } },
        { name: 'User 1b', site: { currentProjectId: 'project03' } }
      );

      // update a string attribute
      let user = await env.service.onlineUpdateAttributes<User>({ type: User.TYPE, id: 'user01' }, { name: 'User 1a' });
      expect(user.name).toBe('User 1a');

      // update an object attribute
      user = await env.service.onlineUpdateAttributes<User>(
        { type: User.TYPE, id: 'user01' },
        { site: { currentProjectId: 'project02' } }
      );
      expect(user.site).toEqual({ currentProjectId: 'project02' });

      // update multiple attributes
      user = await env.service.onlineUpdateAttributes<User>(
        { type: User.TYPE, id: 'user01' },
        { name: 'User 1b', site: { currentProjectId: 'project03' } }
      );
      expect(user.name).toBe('User 1b');
      expect(user.site).toEqual({ currentProjectId: 'project03' });
    }));

    it('OnlinePersist', async(async () => {
      env.expectUpdateRequestType(RequestType.OnlinePersist);
      env.expectObservable(
        env.service.get<User>({ type: User.TYPE, id: 'user01' }),
        (r, e) => expect(r.data.name).toBe(e),
        'User 1',
        'User 1a'
      );

      // update a string attribute
      const user = await env.service.onlineUpdateAttributes<User>(
        { type: User.TYPE, id: 'user01' },
        { name: 'User 1a' },
        true
      );
      expect(user.name).toBe('User 1a');
    }));
  });

  it('onlineDelete', async(async () => {
    env.expectUpdateRequestType(RequestType.OnlinePersist);
    env.expectObservable(
      env.service.get<User>({ type: User.TYPE, id: 'user01' }),
      (r, e) => expect(r.data == null ? null : r.data.id).toBe(e),
      'user01',
      null
    );

    env.expectObservable(
      env.service.getAll<TestProjectUser>(TestProjectUser.TYPE),
      (r, e) => expect(r.data.map(pu => pu.id).sort()).toEqual(e),
      ['projectuser01', 'projectuser02', 'projectuser03', 'projectuser04'],
      ['projectuser03', 'projectuser04']
    );

    await env.service.onlineDelete({ type: User.TYPE, id: 'user01' });
  }));

  it('resourceDeleted', async(async () => {
    env.expectObservable(env.service.resourceDeleted(User.TYPE), (user, exId) => expect(user.id).toBe(exId), 'user01');

    env.expectObservable(
      env.service.resourceDeleted(TestProjectUser.TYPE),
      (projectUser, exId) => expect(projectUser.id).toBe(exId),
      'projectuser01',
      'projectuser02'
    );

    await env.service.delete({ type: User.TYPE, id: 'user01' });
  }));
});

class TestProject extends Project {
  static readonly TYPE: string = 'project';

  num?: number;
  taskNames: string[];

  constructor(init?: Partial<TestProject>) {
    super(TestProject.TYPE, init);
  }
}

class TestProjectRef extends ProjectRef {
  static readonly TYPE: string = TestProject.TYPE;

  constructor(id: string) {
    super(TestProjectRef.TYPE, id);
  }
}

class TestProjectUser extends ProjectUser {
  static readonly TYPE: string = 'projectUser';

  name?: string;

  constructor(init?: Partial<TestProjectUser>) {
    super(TestProject.TYPE, init);
  }
}

class TestProjectUserRef extends ProjectUserRef {
  static readonly TYPE: string = TestProjectUser.TYPE;

  constructor(id: string) {
    super(TestProjectUserRef.TYPE, id);
  }
}

class TestEnvironment extends SubscriptionDisposable {
  readonly service: JsonApiService;

  readonly mockedOrbitService = mock(OrbitService);
  readonly mockedJsonRpcService = mock(JsonRpcService);

  readonly schema: Schema;
  readonly store: XForgeStore;

  constructor() {
    super();
    const domainModel = new DomainModel({
      resourceTypes: [TestProject, TestProjectUser],
      resourceRefTypes: [TestProjectRef, TestProjectUserRef],
      realtimeDataTypes: []
    });

    this.schema = new Schema(TEST_SCHEMA_SETTINGS);
    this.store = new XForgeStore({ schema: this.schema });
    this.store.cache.patch(t => [
      t.addRecord({
        type: 'user',
        id: 'user01',
        attributes: { name: 'User 1', site: { currentProjectId: 'project01' } }
      }),
      t.addRecord({ type: 'user', id: 'user02', attributes: { name: 'User 2' } }),
      t.addRecord({ type: 'project', id: 'project01', attributes: { projectName: 'Project 1', num: 1 } }),
      t.addRecord({ type: 'project', id: 'project02', attributes: { projectName: 'Project 2', num: 2 } }),
      t.addRecord({ type: 'project', id: 'project03', attributes: { projectName: 'Project 3', num: 3 } }),
      t.addRecord({
        type: 'projectUser',
        id: 'projectuser01',
        attributes: { role: 'admin', name: 'Project User 1' },
        relationships: {
          user: { data: { type: 'user', id: 'user01' } },
          project: { data: { type: 'project', id: 'project01' } }
        }
      }),
      t.addRecord({
        type: 'projectUser',
        id: 'projectuser02',
        attributes: { role: 'admin', name: 'Project User 2' },
        relationships: {
          user: { data: { type: 'user', id: 'user01' } },
          project: { data: { type: 'project', id: 'project02' } }
        }
      }),
      t.addRecord({
        type: 'projectUser',
        id: 'projectuser03',
        attributes: { role: 'user', name: 'Project User 3' },
        relationships: {
          user: { data: { type: 'user', id: 'user02' } },
          project: { data: { type: 'project', id: 'project02' } }
        }
      }),
      t.addRecord({
        type: 'projectUser',
        id: 'projectuser04',
        attributes: { role: 'admin', name: 'Project User 4' },
        relationships: {
          user: { data: { type: 'user', id: 'user02' } },
          project: { data: { type: 'project', id: 'project03' } }
        }
      })
    ]);
    when(this.mockedOrbitService.schema).thenReturn(this.schema);
    when(this.mockedOrbitService.store).thenReturn(this.store);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        JsonApiService,
        { provide: DomainModel, useValue: domainModel },
        { provide: OrbitService, useFactory: () => instance(this.mockedOrbitService) },
        { provide: JsonRpcService, useFactory: () => instance(this.mockedJsonRpcService) }
      ]
    });
    this.service = TestBed.get(JsonApiService);
  }

  expectQueryRequestType(expected: RequestType): void {
    this.subscribe(fromEvent(this.store, 'beforeQuery'), (query: Query) =>
      expect(query.options.requestType).toBe(expected)
    );
  }

  expectUpdateRequestType(expected: RequestType): void {
    this.subscribe(fromEvent(this.store, 'beforeUpdate'), (transform: Transform) =>
      expect(transform.options.requestType).toBe(expected)
    );
  }

  expectObservable<TRes, TExp>(
    observable: Observable<TRes>,
    check: (r: TRes, exp: TExp) => void,
    ...expected: TExp[]
  ): Subscription {
    let i = 0;
    return this.subscribe(
      observable,
      r => {
        if (i < expected.length) {
          check(r, expected[i]);
        }
        i++;
      },
      undefined,
      () =>
        expect(i)
          .withContext('The observable did not emit the correct number of times')
          .toBe(expected.length)
    );
  }
}
