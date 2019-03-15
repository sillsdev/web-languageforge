import { Observable, of } from 'rxjs';
import { Snapshot } from 'sharedb/lib/client';

import { RealtimeDoc } from 'xforge-common/realtime-doc';

export class MockRealtimeDoc<T> implements RealtimeDoc {
  readonly version: number = 1;
  readonly pendingOps: any[] = [];

  constructor(public readonly type: string, public readonly id: string, public readonly data: T) {}

  idle(): Observable<void> {
    return of();
  }

  fetch(): Promise<void> {
    return Promise.resolve();
  }

  ingestSnapshot(_snapshot: Snapshot): Promise<void> {
    return Promise.resolve();
  }

  subscribe(): Promise<void> {
    return Promise.resolve();
  }

  submitOp(_data: any, _source?: any): Promise<void> {
    return Promise.resolve();
  }

  remoteChanges(): Observable<any> {
    return of();
  }

  destroy(): Promise<void> {
    return Promise.resolve();
  }
}
