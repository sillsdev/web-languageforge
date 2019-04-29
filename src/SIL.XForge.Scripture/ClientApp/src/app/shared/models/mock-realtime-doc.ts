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
    if (_data[0]) {
      const li = _data[0].li;
      const ld = _data[0].ld;
      const path = _data[0].p;
      if (ld && this.data[path[0]]) {
        if (path.length === 1) {
          delete this.data[path[0]];
        } else {
          this.data[path[0]][path[1]].splice([path[2]], 1);
        }
      }
      if (li) {
        if (path.length === 1) {
          this.data[path[0]] = li;
        } else {
          this.data[path[0]][path[1]][path[2]] = li;
        }
      }
    }
    return Promise.resolve();
  }

  remoteChanges(): Observable<any> {
    return of();
  }

  destroy(): Promise<void> {
    return Promise.resolve();
  }
}
