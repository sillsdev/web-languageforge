import { OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export abstract class SubscriptionDisposable implements OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected subscribe<T>(observable: Observable<T>,
    next?: (value: T) => void, error?: (error: any) => void, complete?: () => void
  ): Subscription {
    return observable.pipe(takeUntil(this.ngUnsubscribe)).subscribe(next, error, complete);
  }
}
