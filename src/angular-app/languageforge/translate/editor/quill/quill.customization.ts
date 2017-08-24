import Parchment from 'parchment';
import * as quill from 'quill';
export { QuillOptionsStatic, BoundsStatic, RangeStatic, DeltaStatic, Delta, StringMap } from 'quill';

export interface Selection {
  lastRange: quill.RangeStatic;
}

export declare class Quill extends quill.Quill {
  theme: SuggestionsTheme;
  selection: Selection
}

export interface Theme {
  quill: Quill;
  options: quill.QuillOptionsStatic;
}

export interface SuggestionsTheme extends Theme {
  moreTooltip: Tooltip;
  suggestTooltip: Tooltip;
}

export class FormatMachine {
  constructor(
    public status?: string,
    public machineHasLearnt?: string
  ) {}
}

export interface Tooltip {
  quill: Quill;
  boundsContainer: quill.BoundsStatic | Element;
  root: any;
  hide(): void;
  position(reference: any): number;
  show(): void;
}

declare class QuillTheme implements Theme {
  quill: Quill;
  options: quill.QuillOptionsStatic;
  constructor(quill: Quill, options: quill.QuillOptionsStatic);
}

declare class QuillTooltip implements Tooltip {
  quill: Quill;
  boundsContainer: quill.BoundsStatic | Element;
  root: any;
  constructor(quill: Quill, boundsContainer: quill.BoundsStatic);
  hide(): void;
  position(reference: any): number;
  show(): void;
}

declare class QuillModule {
  constructor(quill: quill.Quill, options: quill.QuillOptionsStatic);
}

export function registerSuggestionsTheme() : void {
  const Tooltip = Quill.import('ui/tooltip') as typeof QuillTooltip;
  const Module = Quill.import('core/module') as typeof QuillModule;
  const Block = Quill.import('blots/block') as typeof Parchment.Block;
  const Scroll = Quill.import('blots/scroll') as typeof Parchment.Scroll;
  const BubbleTheme = Quill.import('themes/bubble') as typeof QuillTheme;

  // Add a 'more' control to Quill
  class MoreTooltip extends Tooltip {
    static TEMPLATE = '';

    constructor(quill: Quill, boundsContainer: quill.BoundsStatic) {
      super(quill, boundsContainer);

      this.boundsContainer = boundsContainer || document.body;
      this.quill = quill;
      this.root = quill.addContainer('ql-more-tooltip');
      this.root.innerHTML = MoreTooltip.TEMPLATE;
      let offset = parseInt(window.getComputedStyle(this.root).marginTop);
      this.quill.root.addEventListener('scroll', () => {
        this.root.style.marginTop = (-1 * this.quill.root.scrollTop) + offset + 'px';
      });
      this.root.addEventListener('mousedown', (event: any) => {
        let rect = this.root.getBoundingClientRect();
        if (event.clientX > rect.left && event.clientX < rect.right &&
          event.clientY > rect.top && event.clientY < rect.bottom
        ) {
          this.quill.theme.suggestTooltip.hide();
          event.preventDefault();
        }
      });
      this.hide();
    }

    position(reference: any) {
      let top = reference.top + this.quill.root.scrollTop +
        (reference.height - this.root.clientHeight) / 2;
      this.root.style.top = top + 'px';
      this.root.style.left = this.quill.root.clientWidth + 2 * this.quill.root.offsetLeft
        - this.root.clientWidth + 'px';
      return 0;
    };
  }

  class More extends Module {
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
      let node = (super.create(value) as any);
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
      let format = new FormatMachine();
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
  class SuggestTooltip extends Tooltip {
    static TEMPLATE = '<span class="ql-suggest-tooltip-arrow"></span>';

    constructor(quill: Quill, boundsContainer: quill.BoundsStatic) {
      super(quill, boundsContainer);
      this.boundsContainer = boundsContainer || document.body;
      this.quill = quill;
      this.root = quill.addContainer('ql-suggest-tooltip');
      this.root.innerHTML = SuggestTooltip.TEMPLATE;
      let offset = parseInt(window.getComputedStyle(this.root).marginTop);
      this.quill.root.addEventListener('scroll', function () {
        this.root.style.marginTop = (-1 * this.quill.root.scrollTop) + offset + 'px';
      }.bind(this));
      this.hide();
    }

    position(reference: any) {
      let shift = (super.position(reference) as number);
      let top = reference.bottom + this.quill.root.scrollTop + 10;
      this.root.style.top = top + 'px';
      let arrow = this.root.querySelector('.ql-suggest-tooltip-arrow');
      arrow.style.marginLeft = '';
      if (shift === 0) return shift;
      arrow.style.marginLeft = (-1 * shift - arrow.offsetWidth / 2) + 'px';
    };
  }

  class Suggestions extends Module {
    container: any;

    constructor(quill: any, options: any) {
      super(quill, options);

      // initially container is sibling of <ng-quill-editor>
      this.container = quill.container.parentNode.parentNode.parentNode
        .querySelector(options.container);
      quill.theme.suggestTooltip.root.appendChild(this.container);
    }
  }

  // Customize the Bubble theme in Quill
  class SuggestionsBubbleTheme extends BubbleTheme implements SuggestionsTheme {
    moreTooltip: Tooltip;
    suggestTooltip: Tooltip;

    constructor(quill: Quill, options: quill.QuillOptionsStatic) {
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
}
