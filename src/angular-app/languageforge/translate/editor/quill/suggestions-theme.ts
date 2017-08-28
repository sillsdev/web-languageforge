import Parchment from 'parchment';
import Quill, { BoundsStatic, Module, QuillOptionsStatic, Theme, Tooltip } from 'quill';

export interface SuggestionsTheme extends Theme {
  moreTooltip: Tooltip;
  suggestTooltip: Tooltip;
}

export interface DropFunction {
  (file: File, editor: Quill, event: DragEvent | ClipboardEvent): void;
}

export interface PasteFunction {
  (item: DataTransferItem, editor: Quill, event: ClipboardEvent): void;
}

export class FormatMachine {
  status?: string;
  machineHasLearnt?: string;
}

export function registerSuggestionsTheme(): void {
  const QuillTooltip = Quill.import('ui/tooltip') as typeof Tooltip;
  const QuillModule = Quill.import('core/module') as typeof Module;
  const Block = Quill.import('blots/block') as typeof Parchment.Block;
  const Scroll = Quill.import('blots/scroll') as typeof Parchment.Scroll;
  const BubbleTheme = Quill.import('themes/bubble') as typeof Theme;

  // noinspection JSUnusedLocalSymbols
  let dropElements: HTMLElement[] = [];

  // Add a 'more' control to Quill
  class MoreTooltip extends QuillTooltip {
    static TEMPLATE = '';

    constructor(quill: Quill, boundsContainer: BoundsStatic) {
      super(quill, boundsContainer);

      this.boundsContainer = boundsContainer || document.body;
      this.quill = quill;
      this.root = quill.addContainer('ql-more-tooltip');
      this.root.innerHTML = MoreTooltip.TEMPLATE;
      const offset = parseInt(window.getComputedStyle(this.root).marginTop, 10);
      this.quill.root.addEventListener('scroll', () => {
        this.root.style.marginTop = (-1 * this.quill.root.scrollTop) + offset + 'px';
      });
      this.root.addEventListener('mousedown', (event: any) => {
        const rect = this.root.getBoundingClientRect();
        if (event.clientX > rect.left && event.clientX < rect.right &&
          event.clientY > rect.top && event.clientY < rect.bottom
        ) {
          (this.quill.theme as SuggestionsTheme).suggestTooltip.hide();
          event.preventDefault();
        }
      });
      this.hide();
    }

    position(reference: any) {
      const top = reference.top + this.quill.root.scrollTop +
        (reference.height - this.root.clientHeight) / 2;
      this.root.style.top = top + 'px';
      this.root.style.left = this.quill.root.clientWidth + 2 * this.quill.root.offsetLeft
        - this.root.clientWidth + 'px';
      return 0;
    }
  }

  class More extends QuillModule {
    container: any;

    constructor(quill: any, options: any) {
      super(quill, options);

      // initially container is sibling of <ng-quill-editor>
      this.container = quill.container.parentNode.parentNode.parentNode
        .querySelector(options.container);
      quill.theme.moreTooltip.root.appendChild(this.container);
    }
  }

  class StateBlock extends Block {
    // noinspection JSUnusedGlobalSymbols
    static blotName = 'state';
    static className = Block.className;
    static tagName = Block.tagName;
    static scope = Block.scope;

    // noinspection JSUnusedGlobalSymbols
    static allowedChildren = Block.allowedChildren;

    // noinspection JSUnusedGlobalSymbols
    static defaultChild = Block.defaultChild;

    constructor(domNode: any) {
      super(domNode);
    }

    static create(value: FormatMachine) {
      const node = (super.create(value) as any);
      if (value) {
        if (value.status) {
          node.setAttribute('data-status', value.status);
        }

        if (value.machineHasLearnt) {
          node.setAttribute('data-machine-has-learnt', value.machineHasLearnt);
        }
      }

      return node;
    }

    static formats(node: any): FormatMachine {
      const format = new FormatMachine();
      if (node.hasAttribute('data-status')) {
        format.status = node.getAttribute('data-status');
      }

      if (node.hasAttribute('data-machine-has-learnt')) {
        format.machineHasLearnt = node.getAttribute('data-machine-has-learnt');
      }

      return format;
    }

    static value(node: any) {
      return StateBlock.formats(node);
    }

    format(name: string, value: any) {
      if (name === 'status' || name === 'machineHasLearnt') {
        let attributeName = 'data-' + name;
        if (name === 'machineHasLearnt') {
          attributeName = 'data-machine-has-learnt';
        }

        this.domNode.setAttribute(attributeName, value);
      } else {
        super.format(name, value);
      }
    }

    // noinspection JSUnusedGlobalSymbols
    optimize(context: any) {
      super.optimize(context);
      const Break = Quill.import('blots/break');
      if (this.children.length === 0 ||
        (this.children.length === 1 && this.children.head instanceof Break)
      ) {
        this.formatAt(0, 1, 'block', true);
      }
    }
  }

  Scroll.allowedChildren.push(StateBlock);

  // Add a suggest tooltip to Quill
  class SuggestTooltip extends QuillTooltip {
    static TEMPLATE = '<span class="ql-suggest-tooltip-arrow"></span>';

    constructor(quill: Quill, boundsContainer: BoundsStatic) {
      super(quill, boundsContainer);
      this.boundsContainer = boundsContainer || document.body;
      this.quill = quill;
      this.root = quill.addContainer('ql-suggest-tooltip');
      this.root.innerHTML = SuggestTooltip.TEMPLATE;
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
      (quill.theme as SuggestionsTheme).suggestTooltip.root.appendChild(this.container);
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
            selection.setBaseAndExtent(range.startContainer, range.startOffset, range.startContainer, range.startOffset);
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
        let dt = event.dataTransfer;
        if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.includes('Files'))) {
          let elements = document.getElementsByClassName('ql-editor');
          [].forEach.call(elements, (element: HTMLElement, index: number) => {
            element.classList.add('drop-box');
            if (!element.id) element.id = 'ql-editor-' + index;
            dropElements.push(element);
          });
          window.clearTimeout(dragTimer);
        }
      });

      document.addEventListener('dragleave', (event: DragEvent) => {
        let element = event.target as HTMLElement;
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
      dropElements.forEach((dropElement) => {
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
      dropElements.forEach((element) => element.classList.remove('drop-box'));
      dropElements = [];
    }

  }

  // Customize the Bubble theme in Quill
  class SuggestionsBubbleTheme extends BubbleTheme implements SuggestionsTheme {
    moreTooltip: Tooltip;
    suggestTooltip: Tooltip;

    constructor(quill: Quill, options: QuillOptionsStatic) {
      super(quill, options);
      const QuillMoreTooltip = Quill.import('ui/more-tooltip');
      const QuillSuggestTooltip = Quill.import('ui/suggest-tooltip');
      this.moreTooltip = new QuillMoreTooltip(this.quill, this.options.bounds);
      this.suggestTooltip = new QuillSuggestTooltip(this.quill, this.options.bounds);
    }
  }

  Quill.register('ui/more-tooltip', MoreTooltip);
  Quill.register('modules/more', More);
  Quill.register('blots/state', StateBlock);
  Quill.register('blots/scroll', Scroll, true);
  Quill.register('ui/suggest-tooltip', SuggestTooltip);
  Quill.register('modules/suggestions', Suggestions);
  Quill.register('themes/suggestions', SuggestionsBubbleTheme);
  Quill.register('modules/dragAndDrop', DragAndDrop);

  DragAndDrop.monitorFileDragEvents();
}
