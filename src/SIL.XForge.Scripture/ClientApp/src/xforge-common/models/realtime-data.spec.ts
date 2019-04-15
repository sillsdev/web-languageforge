import { Callback, Doc, OTType, Snapshot } from 'sharedb/lib/client';
import { async } from '@angular/core/testing';
import { MemoryRealtimeDoc } from 'xforge-common/realtime-doc';
import { RealtimeData } from './realtime-data';

describe('RealtimeData', () => {
  it('reports create events', async(() => {
    const cache = new MemoryRealtimeDoc(null, null, null);
    const realtimeData = new ConcreteRealtimeData('type', cache, null);
    let callbackCount = 0;
    const callback = () => {
      callbackCount++;
    };
    realtimeData.onCreate().subscribe(callback);
    cache.onCreateSubject.next();
    cache.onCreateSubject.next();

    expect(callbackCount).toEqual(2);
  }));
});

class ConcreteRealtimeData<T = any, Ops = any> extends RealtimeData {}
