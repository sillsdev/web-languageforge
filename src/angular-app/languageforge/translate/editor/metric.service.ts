export class Metrics {
  keyBackspaceCount: number = 0;
  keyDeleteCount: number = 0;
  keyCharacterCount: number = 0;
  keyNavigationCount: number = 0;
  mouseClickCount: number = 0;
  suggestionAcceptedCount: number = 0;
  suggestionTotalCount: number = 0;
  wordCount: number = 0;
  timeEditActive: number = 0;
  timeTotal: number = 0;
}

export class MetricService {
  private _metrics: Metrics = new Metrics();
  private activeEditTimeout: number;
  private activeEditCountdown: number;
  private editingTimeout: number;
  private editingCountdown: number;
  private timer: angular.IPromise<any>;

  static $inject: string[] = ['$interval'];
  constructor(private $interval: angular.IIntervalService) {
    this.timer = this.$interval(this.onTimer, 1000);
  }

  get metrics(): Metrics {
    return this._metrics;
  }

  // arrow functions used here and below to bind to the class instance. IJH 2017-09

  onKeyDown = (event: KeyboardEvent): void => {
    this.editingCountdown = this.editingTimeout;
    switch(event.key) {
      case 'Delete':
        this._metrics.keyDeleteCount++;
        break;
      case 'Backspace':
        this._metrics.keyBackspaceCount++;
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowRight':
      case 'ArrowLeft':
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        this._metrics.keyNavigationCount++;
        break;
    }
  };

  onKeyPress = (): void => {
    this._metrics.keyCharacterCount++;
    this.activeEditCountdown = this.activeEditTimeout;
    this.editingCountdown = this.editingTimeout;
  };

  onMouseDown = (): void => {
    this._metrics.mouseClickCount++;
    this.editingCountdown = this.editingTimeout;
  };

  onSuggestionGiven = (): void => {
    this._metrics.suggestionTotalCount++;
  };

  onSuggestionTaken = (): void => {
    this._metrics.suggestionAcceptedCount++;
    this.editingCountdown = this.editingTimeout;
  };

  onTimer = (): void => {
    this._metrics.timeTotal++;
    if (this.isActiveEdit) {
      this.activeEditCountdown--;
      this._metrics.timeEditActive++;
      if (!this.isActiveEdit) {
        this._metrics.timeEditActive -= this.activeEditTimeout;
      }
    }

    if (this.isEditing) {
      this.editingCountdown--;
      if (!this.isEditing) {
        // ToDo: post metrics to server
        console.log('editing timed out');
      }
    }
  };

  reset(): void {
    // never reset timeTotal because it is reset on page load (start session)
    this._metrics.keyBackspaceCount = 0;
    this._metrics.keyDeleteCount = 0;
    this._metrics.keyCharacterCount = 0;
    this._metrics.keyNavigationCount = 0;
    this._metrics.mouseClickCount = 0;
    this._metrics.suggestionAcceptedCount = 0;
    this._metrics.suggestionTotalCount = 0;
    this._metrics.wordCount = 0;
    this._metrics.timeEditActive = 0;
  }

  setTimeouts(activeEditTimeout: number, editingTimeout: number): void {
    this.activeEditTimeout = activeEditTimeout;
    this.editingTimeout = editingTimeout;
    console.log('activeEditTimeout:', this.activeEditTimeout);
    console.log('editingTimeout:', this.editingTimeout);
  }

  private get isActiveEdit(): boolean {
    return this.activeEditCountdown > 0;
  }

  private get isEditing(): boolean {
    return this.editingCountdown > 0;
  }

}
