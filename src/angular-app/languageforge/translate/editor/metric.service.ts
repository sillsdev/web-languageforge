import * as angular from 'angular';

import { TranslateProjectService } from '../core/translate-project.service';

export class Metrics {
  keyBackspaceCount: number = 0;
  keyDeleteCount: number = 0;
  keyCharacterCount: number = 0;
  keyNavigationCount: number = 0;
  mouseClickCount: number = 0;
  suggestionAcceptedCount: number = 0;
  suggestionTotalCount: number = 0;
  timeEditActive: number = 0;
  timeTotal: number = 0;
}

export class MetricService {
  currentDocumentSetId: string;

  private _metrics: Metrics = new Metrics();
  private metricId: string = '';
  private hasActiveEdits: boolean = false;
  private activeEditTimeout: number;
  private activeEditCountdown: number;
  private editingTimeout: number;
  private editingCountdown: number;
  private timer: angular.IPromise<null>;

  static $inject: string[] = ['$interval', 'translateProjectApi'];
  constructor(private $interval: angular.IIntervalService, private projectApi: TranslateProjectService) {
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
        this.hasActiveEdits = true;
        this.activeEditCountdown = this.activeEditTimeout;
        break;
      case 'Backspace':
        this._metrics.keyBackspaceCount++;
        this.hasActiveEdits = true;
        this.activeEditCountdown = this.activeEditTimeout;
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
    this.hasActiveEdits = true;
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
        this.sendMetrics();
      }
    }

    if (this.isEditing) {
      this.editingCountdown--;
      if (!this.isEditing) {
        this.sendMetrics(true);
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
    this._metrics.timeEditActive = 0;

    this.hasActiveEdits = false;
    this.activeEditCountdown = 0;
  }

  sendMetrics(doReset: boolean = false, documentSetId: string = this.currentDocumentSetId): angular.IPromise<any> {
    doReset = this.hasActiveEdits && doReset;
    console.log('metrics sent', this._metrics.timeEditActive, this.currentDocumentSetId, this.metricId, doReset);
    const promise = this.projectApi.updateMetrics(this._metrics, this.currentDocumentSetId, this.metricId)
      .then(result => {
        if (result.ok && !doReset) {
          this.metricId = result.data;
        }
      });
    if (documentSetId !== this.currentDocumentSetId) {
      this.currentDocumentSetId = documentSetId;
    }

    if (doReset) {
      this.reset();
      this.metricId = '';
    }

    return promise;
  }

  setTimeouts(activeEditTimeout: number, editingTimeout: number): void {
    this.activeEditTimeout = activeEditTimeout;
    this.editingTimeout = editingTimeout;
  }

  private get isActiveEdit(): boolean {
    return this.activeEditCountdown > 0;
  }

  private get isEditing(): boolean {
    return this.editingCountdown > 0;
  }

}
