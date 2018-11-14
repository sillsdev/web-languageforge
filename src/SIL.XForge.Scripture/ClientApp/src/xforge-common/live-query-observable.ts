import { Query } from '@orbit/data';
import Store from '@orbit/store';
import { Observable, Operator } from 'rxjs';

export class LiveQueryObservable<T> extends Observable<T> {
  constructor(public source: Observable<any>, private readonly store: Store, private readonly query: Query) {
    super();
  }

  lift<R>(operator: Operator<T, R>): Observable<R> {
    const observable = new LiveQueryObservable<R>(this.source, this.store, this.query);
    observable.operator = operator;
    return observable;
  }

  update(): void {
    this.store.query(this.query);
  }
}
