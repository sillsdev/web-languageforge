import { clone, eq } from '@orbit/utils';
import { fromEvent, interval, merge, Subject } from 'rxjs';
import { buffer, debounceTime, filter, map, tap } from 'rxjs/operators';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { objectId } from 'xforge-common/utils';
import { TranslateMetrics, TranslateMetricsType } from '../../core/models/translate-metrics';
import { SFProjectService } from '../../core/sfproject.service';
import { TextComponent } from '../../shared/text/text.component';

export const ACTIVE_EDIT_TIMEOUT = 2000; // 2 seconds
export const EDIT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
export const SEND_METRICS_INTERVAL = 30 * 1000; // 30 seconds

function getKeyActivityType(event: KeyboardEvent): ActivityType {
  let type = ActivityType.Unknown;
  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowRight':
    case 'ArrowLeft':
    case 'Home':
    case 'End':
    case 'PageUp':
    case 'PageDown':
      type = ActivityType.Navigation;
      break;

    case 'Delete':
      type = ActivityType.Delete;
      break;

    case 'Backspace':
      type = ActivityType.Backspace;
      break;

    default:
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        type = ActivityType.Char;
      }
      break;
  }
  return type;
}

function createKeyActivity(event: KeyboardEvent): Activity {
  return { type: getKeyActivityType(event), event };
}

function isActiveEditKeyActivity(type: ActivityType): boolean {
  return type === ActivityType.Backspace || type === ActivityType.Delete || type === ActivityType.Char;
}

enum ActivityType {
  Unknown,
  Delete,
  Backspace,
  Char,
  Navigation,
  Click,
  Suggestion
}

interface Activity {
  type: ActivityType;
  event: Event;
}

export class TranslateMetricsSession extends SubscriptionDisposable {
  id: string;
  metrics: TranslateMetrics;

  private text: TextComponent;
  private projectId: string;
  private prevMetrics: TranslateMetrics;
  private readonly suggestionAccepted$ = new Subject<Activity>();
  private navigateSuggestionShown: boolean = false;

  constructor(private readonly projectService: SFProjectService) {
    super();
  }

  get prevMetricsId(): string {
    return this.prevMetrics == null ? '' : this.prevMetrics.id;
  }

  private get isMetricsEmpty(): boolean {
    return (
      this.metrics.keyBackspaceCount == null &&
      this.metrics.keyCharacterCount == null &&
      this.metrics.keyDeleteCount == null &&
      this.metrics.keyNavigationCount == null &&
      this.metrics.mouseClickCount == null &&
      this.metrics.productiveCharacterCount == null &&
      this.metrics.suggestionAcceptedCount == null &&
      this.metrics.suggestionTotalCount == null &&
      this.metrics.timeEditActive == null
    );
  }

  start(projectId: string, text: TextComponent): void {
    if (this.id != null) {
      this.dispose();
    }

    this.id = objectId();
    this.projectId = projectId;
    this.text = text;
    this.createMetrics('navigate');

    if (this.text.editor != null) {
      this.setupSubscriptions();
    } else {
      this.text.loaded.subscribe(() => this.setupSubscriptions());
    }
  }

  dispose(): void {
    super.dispose();
    this.sendMetrics();
    this.id = undefined;
    this.metrics = undefined;
    this.text = undefined;
    this.projectId = undefined;
    this.navigateSuggestionShown = false;
    this.prevMetrics = undefined;
  }

  onSuggestionShown(): void {
    if (this.metrics.type === 'navigate') {
      this.navigateSuggestionShown = true;
    } else {
      this.incrementMetric('suggestionTotalCount');
    }
  }

  onSuggestionAccepted(event: Event): void {
    this.suggestionAccepted$.next({ type: ActivityType.Suggestion, event });
  }

  private setupSubscriptions(): void {
    const keyDowns$ = fromEvent<KeyboardEvent>(this.text.editor.root, 'keydown').pipe(
      filter(event => getKeyActivityType(event) !== ActivityType.Unknown),
      map<KeyboardEvent, Activity>(event => createKeyActivity(event))
    );
    const keyUps$ = fromEvent<KeyboardEvent>(this.text.editor.root, 'keyup').pipe(
      filter(event => getKeyActivityType(event) !== ActivityType.Unknown),
      map<KeyboardEvent, Activity>(event => createKeyActivity(event))
    );
    const mouseClicks$ = fromEvent(window.document, 'mousedown').pipe(
      map<Event, Activity>(event => ({ type: ActivityType.Click, event }))
    );

    // navigation keystrokes
    const navigationKeyDowns$ = keyDowns$.pipe(filter(activity => activity.type === ActivityType.Navigation));
    this.subscribe(navigationKeyDowns$, () => this.onNavigationKey());

    // mouse clicks
    this.subscribe(mouseClicks$, () => this.onMouseDown());

    // edit activity
    const editActivity$ = merge(keyDowns$, mouseClicks$);
    this.subscribe(editActivity$.pipe(debounceTime(EDIT_TIMEOUT)), () => this.endEditIfNecessary());

    // segment changes
    this.subscribe(this.text.segmentRefChange, () => this.endEditIfNecessary());

    // active edit activity
    const activeEditKeyDowns$ = keyDowns$.pipe(filter(activity => isActiveEditKeyActivity(activity.type)));
    const activeEditKeyUps$ = keyUps$.pipe(filter(activity => isActiveEditKeyActivity(activity.type)));
    const activeEditActivity$ = merge(activeEditKeyDowns$, activeEditKeyUps$, this.suggestionAccepted$);
    this.subscribe(
      activeEditActivity$.pipe(
        tap(activity => this.startEditIfNecessary(activity)),
        buffer(activeEditActivity$.pipe(debounceTime(ACTIVE_EDIT_TIMEOUT)))
      ),
      activities => this.onActiveEdit(activities)
    );

    // periodic send
    this.subscribe(interval(SEND_METRICS_INTERVAL), () => this.sendMetrics());
  }

  private async sendMetrics(): Promise<void> {
    if (this.metrics == null) {
      return;
    }

    if (this.metrics.type === 'edit') {
      let prodCharCount = 0;
      if (this.text.segment != null) {
        prodCharCount = this.text.segment.productiveCharacterCount;
      }
      this.metrics.productiveCharacterCount = prodCharCount === 0 ? undefined : prodCharCount;
    }
    if (!this.isMetricsEmpty && !eq(this.prevMetrics, this.metrics)) {
      this.prevMetrics = clone(this.metrics);
      await this.projectService.addTranslateMetrics(this.projectId, this.metrics);
    }
  }

  private onActiveEdit(activities: Activity[]): void {
    for (const activity of activities) {
      if (activity.event.type === 'click' || activity.event.type === 'keydown') {
        switch (activity.type) {
          case ActivityType.Delete:
            this.incrementMetric('keyDeleteCount');
            break;
          case ActivityType.Backspace:
            this.incrementMetric('keyBackspaceCount');
            break;
          case ActivityType.Char:
            this.incrementMetric('keyCharacterCount');
            break;
          case ActivityType.Suggestion:
            this.incrementMetric('suggestionAcceptedCount');
            break;
        }
      }
    }

    let timeSpan = 30;
    if (activities.length > 1) {
      timeSpan = activities[activities.length - 1].event.timeStamp - activities[0].event.timeStamp;
    }
    this.incrementMetric('timeEditActive', Math.round(timeSpan));
  }

  private onNavigationKey(): void {
    this.incrementMetric('keyNavigationCount');
  }

  private onMouseDown(): void {
    this.incrementMetric('mouseClickCount');
  }

  private startEditIfNecessary(activity: Activity): void {
    if (this.metrics.type === 'navigate') {
      if (activity.event.type === 'click') {
        this.decrementMetric('mouseClickCount');
      }
      this.sendMetrics();
      this.createMetrics('edit');
      if (activity.event.type === 'click') {
        this.incrementMetric('mouseClickCount');
      }
    }
  }

  private endEditIfNecessary(): void {
    if (this.metrics.type === 'edit') {
      this.sendMetrics();
      this.createMetrics('navigate');
    }
    this.navigateSuggestionShown = false;
  }

  private createMetrics(type: TranslateMetricsType): void {
    this.metrics = {
      id: objectId(),
      type,
      sessionId: this.id
    };
    if (type === 'edit' && this.navigateSuggestionShown) {
      this.metrics.suggestionTotalCount = 1;
    }
    this.navigateSuggestionShown = false;
  }

  private incrementMetric(metric: Extract<keyof TranslateMetrics, string>, amount: number = 1): void {
    if (this.metrics[metric] == null) {
      this.metrics[metric] = 0;
    }
    (this.metrics[metric] as number) += amount;
  }

  private decrementMetric(metric: Extract<keyof TranslateMetrics, string>, amount: number = 1): void {
    if (this.metrics[metric] == null) {
      return;
    }
    (this.metrics[metric] as number) -= amount;
    if (this.metrics[metric] <= 0) {
      this.metrics[metric] = undefined;
    }
  }
}
