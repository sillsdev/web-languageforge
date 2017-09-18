import Parchment from 'parchment';
import Quill, {
  BoundsStatic, Module, Picker, QuillOptionsStatic, RangeStatic, SnowTheme, Theme, Toolbar, Tooltip
} from 'quill';

export interface SuggestionsTheme extends Theme {
  suggestionsTooltip: Tooltip;
}

export type DropFunction = (file: File, editor: Quill, event: DragEvent | ClipboardEvent) => void;

export type PasteFunction = (item: DataTransferItem, editor: Quill, event: ClipboardEvent) => void;

export function registerSuggestionsTheme(): void {
  const QuillTooltip = Quill.import('ui/tooltip') as typeof Tooltip;
  const QuillModule = Quill.import('core/module') as typeof Module;
  const Inline = Quill.import('blots/inline') as typeof Parchment.Inline;
  const QuillSnowTheme = Quill.import('themes/snow') as typeof SnowTheme;
  const QuillToolbar = Quill.import('modules/toolbar') as typeof Toolbar;

  // noinspection JSUnusedLocalSymbols
  let dropElements: HTMLElement[] = [];

  class HighlightBlot extends Inline {
    static formats(node: any): any {
      return { };
    }
  }
  HighlightBlot.blotName = 'highlight';
  HighlightBlot.className = 'highlight';

  // Add a suggest tooltip to Quill
  class SuggestionsTooltip extends QuillTooltip {
    static TEMPLATE = '<span class="ql-suggest-tooltip-arrow"></span>';

    constructor(quill: Quill, boundsContainer: BoundsStatic) {
      super(quill, boundsContainer);
      this.boundsContainer = boundsContainer || document.body;
      this.quill = quill;
      this.root = quill.addContainer('ql-suggest-tooltip');
      this.root.innerHTML = SuggestionsTooltip.TEMPLATE;
      const offset = parseInt(window.getComputedStyle(this.root).marginTop, 10);
      this.quill.root.addEventListener('scroll', () => {
        this.root.style.marginTop = (-1 * this.quill.root.scrollTop) + offset + 'px';
      });
      this.hide();
    }

    position(reference: any) {
      const shift = (super.position(reference) as number);
      const top = reference.bottom + this.quill.root.scrollTop + 10;
      this.root.style.top = top + 'px';
      const arrow = this.root.querySelector('.ql-suggest-tooltip-arrow');
      arrow.style.marginLeft = '';
      if (shift === 0) return shift;
      arrow.style.marginLeft = (-1 * shift - arrow.offsetWidth / 2) + 'px';
    }
  }

  class Suggestions extends QuillModule {
    container: any;

    constructor(quill: Quill, options: any) {
      super(quill, options);

      // initially container is sibling of <ng-quill-editor>
      this.container = quill.container.parentNode.parentNode.parentNode
        .querySelector(options.container);
      (quill.theme as SuggestionsTheme).suggestionsTooltip.root.appendChild(this.container);
    }
  }

  interface DropOptions extends QuillOptionsStatic {
    onDrop?: DropFunction;
    onPaste?: PasteFunction;
  }

  // inspired by https://github.com/kensnyder/quill-image-drop-module and
  // https://github.com/immense/quill-drag-and-drop-module
  class DragAndDrop extends QuillModule {
    options: DropOptions;

    constructor(quill: Quill, options: DropOptions) {
      super(quill, options);
      if (options.onDrop) {
        this.options.onDrop = options.onDrop;
        this.quill.root.addEventListener('drop', this.handleDrop.bind(this));
      }

      if (options.onPaste) {
        this.options.onPaste = options.onPaste;
        this.quill.root.addEventListener('paste', this.handlePaste.bind(this));
      }
    }

    handleDrop(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
        if (document.caretRangeFromPoint) {
          const selection = document.getSelection();
          const range = document.caretRangeFromPoint(event.clientX, event.clientY);
          if (selection && range) {
            selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer,
              range.startOffset);
          }
        }

        [].forEach.call(event.dataTransfer.files, (file: File) => {
          if (this.options.onDrop) this.options.onDrop(file, this.quill, event);
        });
      }
      DragAndDrop.clearDropElementClasses();
    }

    handlePaste(event: ClipboardEvent): void {
      if (event.clipboardData && event.clipboardData.items && event.clipboardData.items.length) {
        [].forEach.call(event.clipboardData.items, (item: DataTransferItem) => {
          if (this.options.onPaste) this.options.onPaste(item, this.quill, event);
        });
      }
    }

    static monitorFileDragEvents(): void {
      let dragTimer: number;
      document.addEventListener('dragover', (event: any) => {
        event.preventDefault();
        const dt = event.dataTransfer;
        if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') !== -1 : dt.types.includes('Files'))) {
          const elements = document.getElementsByClassName('ql-editor');
          [].forEach.call(elements, (element: HTMLElement, index: number) => {
            element.classList.add('drop-box');
            if (!element.id) element.id = 'ql-editor-' + index;
            dropElements.push(element);
          });
          window.clearTimeout(dragTimer);
        }
      });

      document.addEventListener('dragleave', (event: DragEvent) => {
        const element = event.target as HTMLElement;
        if (DragAndDrop.isInDropElements(element)) {
          return;
        }

        dragTimer = window.setTimeout(() => {
          DragAndDrop.clearDropElementClasses();
        }, 25);
      });

      document.addEventListener('drop', (event: DragEvent) => {
        event.preventDefault();
        DragAndDrop.clearDropElementClasses();
      });
    }

    private static isInDropElements(element: HTMLElement): boolean {
      let result = false;
      dropElements.forEach(dropElement => {
        if (dropElement.id === element.id || DragAndDrop.isDescendant(dropElement, element)) {
          result = true;
        }
      });
      return result;
    }

    private static isDescendant(parent: HTMLElement, child: HTMLElement): boolean {
      let node = child.parentNode;
      while (node != null) {
        if (node === parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    }

    private static clearDropElementClasses(): void {
      dropElements.forEach(element => element.classList.remove('drop-box'));
      dropElements = [];
    }

  }

  // Customize the Snow theme in Quill
  class SuggestionsSnowTheme extends QuillSnowTheme implements SuggestionsTheme {
    private static pickers: Picker[];

    suggestionsTooltip: Tooltip;

    constructor(quill: Quill, options: QuillOptionsStatic) {
      super(quill, options);
      const QuillSuggestionsTooltip = Quill.import('ui/suggest-tooltip');
      this.suggestionsTooltip = new QuillSuggestionsTooltip(this.quill, this.options.bounds);
    }

    extendToolbar(toolbar: any): void {
      if (toolbar.container.classList.contains('ql-snow')) {
        // hook up the update() method for pickers to the editor-change event
        this.pickers = SuggestionsSnowTheme.pickers;
        this.quill.on('editor-change', () => {
          for (const picker of this.pickers) {
            picker.update();
          }
        });
      } else {
        super.extendToolbar(toolbar);
        SuggestionsSnowTheme.pickers = this.pickers;
      }
    }
  }

  class MultiEditorToolbar extends QuillToolbar {
    private static currentQuill: Quill;

    attach(input: HTMLElement): void {
      let format: string = [].find.call(input.classList, (className: string) => {
        return className.indexOf('ql-') === 0;
      });
      if (!format) return;
      format = format.slice('ql-'.length);
      if (input.tagName === 'BUTTON') {
        input.setAttribute('type', 'button');
      }
      const eventName = input.tagName === 'SELECT' ? 'change' : 'click';
      input.addEventListener(eventName, e => {
        if (MultiEditorToolbar.currentQuill !== this.quill) {
          return;
        }

        let value: string | boolean;
        if (input.tagName === 'SELECT') {
          const select = input as HTMLSelectElement;
          if (select.selectedIndex < 0) return;
          const selected = select.options[select.selectedIndex];
          if (selected.hasAttribute('selected')) {
            value = false;
          } else {
            value = selected.value || false;
          }
        } else {
          const button = input as HTMLButtonElement;
          if (button.classList.contains('ql-active')) {
            value = false;
          } else {
            value = button.value || !input.hasAttribute('value');
          }
          e.preventDefault();
        }
        this.quill.focus();
        const range = this.quill.getSelection();
        if (this.handlers[format] != null) {
          this.handlers[format].call(this, value);
        } else {
          this.quill.format(format, value, Quill.sources.USER);
        }
        this.update(range);
      });
      // TODO use weakmap
      this.controls.push([format, input]);
    }

    update(range: RangeStatic): void {
      // save the last used editor, so the toolbar knows which editor to update
      if (MultiEditorToolbar.currentQuill === this.quill) {
        super.update(range);
      } else if (this.quill.hasFocus()) {
        MultiEditorToolbar.currentQuill = this.quill;
        super.update(range);
      }
    }
  }

  Quill.register('blots/highlight', HighlightBlot);
  Quill.register('ui/suggest-tooltip', SuggestionsTooltip);
  Quill.register('modules/suggestions', Suggestions);
  Quill.register('themes/suggestions', SuggestionsSnowTheme);
  Quill.register('modules/dragAndDrop', DragAndDrop);
  Quill.register('modules/toolbar', MultiEditorToolbar, true);

  DragAndDrop.monitorFileDragEvents();
}
