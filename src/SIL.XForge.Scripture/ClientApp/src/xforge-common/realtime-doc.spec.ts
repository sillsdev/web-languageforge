import { Callback, Doc, OTType, Snapshot } from 'sharedb/lib/client';
import { SharedbRealtimeDoc } from './realtime-doc';
import { async } from '@angular/core/testing';

describe('SharedbRealtimeDoc', () => {
  it('does not crash with null type', () => {
    // Connection.cs permits type to be null
    const doc = new MockDoc();
    doc.type = null;
    const realtimeDoc = new SharedbRealtimeDoc(doc);
    expect(() => {}).not.toThrow();
  });

  it('reports create events', async(() => {
    const doc = new MockDoc();
    doc.type = null;
    const realtimeDoc = new SharedbRealtimeDoc(doc);
    let callbackCount = 0;
    const callback = () => {
      callbackCount++;
    };
    realtimeDoc.onCreate().subscribe(callback);
    expect(callbackCount).toEqual(2);
  }));
});

class MockDoc implements Doc {
  type: OTType;
  id: string;
  data: any;
  version: number;
  subscribed: boolean;
  wantSubscribe: boolean;
  inflightOp: any;
  pendingOps: any[];
  on(event: any, callback: any): this {
    if (event === 'create') {
      // Fire create a couple times
      callback();
      callback();
    }
    return this;
  }
  off(event: any, callback: any): this {
    throw new Error('Method not implemented.');
  }
  addListener(event: any, callback: any): this {
    throw new Error('Method not implemented.');
  }
  removeListener(event: any, callback: any): this {
    throw new Error('Method not implemented.');
  }
  fetch(callback: Callback): void {
    throw new Error('Method not implemented.');
  }
  subscribe(callback: Callback): void {
    throw new Error('Method not implemented.');
  }
  unsubscribe(callback: Callback): void {
    throw new Error('Method not implemented.');
  }
  ingestSnapshot(snapshot: Snapshot, callback: Callback): void {
    throw new Error('Method not implemented.');
  }
  destroy(callback: Callback): void {
    throw new Error('Method not implemented.');
  }
  create(data: any, type?: string | OTType, options?: any, callback?: Callback): void {
    throw new Error('Method not implemented.');
  }
  submitOp(data: any, options?: any, callback?: Callback): void {
    throw new Error('Method not implemented.');
  }
  del(options: any, callback: Callback): void {
    throw new Error('Method not implemented.');
  }
  whenNothingPending(callback: Callback): void {
    throw new Error('Method not implemented.');
  }
  hasWritePending(): boolean {
    throw new Error('Method not implemented.');
  }
  flush(): void {
    throw new Error('Method not implemented.');
  }
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  }
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  }
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  }
  removeAllListeners(event?: string | symbol): this {
    throw new Error('Method not implemented.');
  }
  setMaxListeners(n: number): this {
    throw new Error('Method not implemented.');
  }
  getMaxListeners(): number {
    throw new Error('Method not implemented.');
  }
  listeners(event: string | symbol): Function[] {
    throw new Error('Method not implemented.');
  }
  rawListeners(event: string | symbol): Function[] {
    throw new Error('Method not implemented.');
  }
  emit(event: string | symbol, ...args: any[]): boolean {
    throw new Error('Method not implemented.');
  }
  eventNames(): (string | symbol)[] {
    throw new Error('Method not implemented.');
  }
  listenerCount(type: string | symbol): number {
    throw new Error('Method not implemented.');
  }
}
