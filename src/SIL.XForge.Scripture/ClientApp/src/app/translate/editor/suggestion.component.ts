import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { eq } from '@orbit/utils';
import Quill from 'quill';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { TextComponent } from '../../shared/text/text.component';

export interface SuggestionSelectedEvent {
  index: number;
  event: Event;
}

@Component({
  selector: 'app-suggestion',
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.scss']
})
export class SuggestionComponent extends SubscriptionDisposable implements AfterViewInit {
  @Input() confidence: number;
  @Input() text: TextComponent;
  @Output() selected = new EventEmitter<SuggestionSelectedEvent>();

  showHelp: boolean = false;

  private _words: string[] = [];
  private top: number;

  constructor(private readonly elemRef: ElementRef) {
    super();
  }

  get words(): string[] {
    return this._words;
  }

  @Input()
  set words(value: string[]) {
    if (!eq(this._words, value)) {
      this._words = value;
      setTimeout(() => this.setPosition());
    }
  }

  get show(): boolean {
    return !this.root.classList.contains('hidden');
  }

  @Input()
  set show(value: boolean) {
    if (value !== this.show) {
      if (value) {
        this.root.classList.remove('hidden');
      } else {
        this.root.classList.add('hidden');
      }
    }
  }

  get isLoading(): boolean {
    return this.words.length === 0;
  }

  get confidencePercentage(): number {
    return Math.round(this.confidence * 100);
  }

  get suggestionStyle(): any {
    const maxOpacity = 1;
    const minOpacity = 0.3;
    const opacity = this.confidence * (maxOpacity - minOpacity) + minOpacity;
    return { opacity };
  }

  private get editor(): Quill {
    return this.text.editor;
  }

  private get root(): HTMLElement {
    return this.elemRef.nativeElement;
  }

  private get boundsContainer(): HTMLElement {
    return document.body;
  }

  ngAfterViewInit(): void {
    if (this.editor.root === this.editor.scrollingContainer) {
      this.subscribe(fromEvent(this.editor.root, 'scroll'), () => this.updateVisibility());
    }
    this.subscribe(
      fromEvent<KeyboardEvent>(this.editor.root, 'keydown').pipe(filter(event => this.isSelectSuggestionEvent(event))),
      event => {
        let index: number;
        if (event.key === 'Enter') {
          index = -1;
        } else {
          index = parseInt(event.key, 10) - 1;
        }
        this.selected.emit({ index, event });
      }
    );
    this.subscribe(fromEvent(window, 'resize'), () => this.setPosition());
    this.subscribe(this.text.updated, () => this.setPosition());
    this.show = false;
  }

  toggleHelp(): void {
    this.showHelp = !this.showHelp;
  }

  selectAll(event: Event): void {
    this.selected.emit({ index: -1, event });
  }

  private setPosition(): void {
    const selection = this.editor.getSelection();
    if (selection == null) {
      return;
    }
    const reference = this.editor.getBounds(selection.index, selection.length);
    const left = reference.left + 1;
    // root.scrollTop should be 0 if scrollContainer !== root
    this.top = reference.bottom + this.editor.root.scrollTop + 1;
    this.root.style.left = left + 'px';
    this.root.style.top = this.top + 'px';
    this.root.classList.remove('flip');
    const containerBounds = this.boundsContainer.getBoundingClientRect();
    const rootBounds = this.root.getBoundingClientRect();
    let shift = 0;
    if (rootBounds.right > containerBounds.right) {
      shift = containerBounds.right - rootBounds.right;
      this.root.style.left = left + shift + 'px';
    }
    if (rootBounds.left < containerBounds.left) {
      shift = containerBounds.left - rootBounds.left;
      this.root.style.left = left + shift + 'px';
    }
    if (rootBounds.bottom > containerBounds.bottom) {
      const height = rootBounds.bottom - rootBounds.top;
      const verticalShift = reference.bottom - reference.top + height;
      this.top -= verticalShift;
      this.root.style.top = this.top + 'px';
      this.root.classList.add('flip');
    }
    this.updateVisibility();
  }

  private updateVisibility(): void {
    const marginTop = -this.editor.root.scrollTop;
    const offsetTop = marginTop + this.top;
    const offsetBottom = offsetTop + this.root.clientHeight;
    if (offsetTop < 0 || offsetBottom > this.editor.scrollingContainer.clientHeight) {
      if (this.root.style.visibility !== 'hidden') {
        this.root.style.visibility = 'hidden';
        this.root.style.marginTop = -this.top + 'px';
      }
    } else {
      this.root.style.marginTop = marginTop + 'px';
      this.root.style.visibility = '';
    }
  }

  private isSelectSuggestionEvent(event: KeyboardEvent): boolean {
    if (!this.show) {
      return false;
    }
    if (event.key === 'Enter') {
      return true;
    }
    if (event.key.length !== 1) {
      return false;
    }
    const keyCode = event.key.charCodeAt(0);
    return (event.ctrlKey || event.metaKey) && (keyCode >= 48 && keyCode <= 57);
  }
}
