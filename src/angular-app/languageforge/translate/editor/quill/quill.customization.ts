import * as Parchment from 'parchment';
import * as quill from 'quill';

export module QuillCustomization {
  declare class Quill extends quill.Quill {
    // noinspection JSUnusedGlobalSymbols
    static imports: string;

    // noinspection ReservedWordAsName
    static import(path: string): any;
    static register(path: string, def: any, suppressWarning?: boolean): void;
  }

  declare class QuillTheme {
    quill: quill.Quill;
    options: quill.QuillOptionsStatic;
    constructor(quill: quill.Quill, options: quill.QuillOptionsStatic);
  }

  declare class QuillTooltip {
    quill: quill.Quill;
    boundsContainer: quill.BoundsStatic | Element;
    root: any;
    constructor(quill: quill.Quill, boundsContainer: quill.BoundsStatic);
    hide(): void;
    position(reference: any): number;
    show(): void;
  }

  declare class QuillModule {
    constructor(quill: quill.Quill, options: quill.QuillOptionsStatic);
  }

  // Customize the Bubble theme in Quill
  export class QuillCustomTheme {
    constructor() {
      new QuillMoreControl();
      new QuillSuggestTooltip();
      const MoreTooltip = Quill.import('ui/more-tooltip');
      const SuggestTooltip = Quill.import('ui/suggest-tooltip');
      const BubbleTheme = Quill.import('themes/bubble') as typeof QuillTheme;
      class CustomBubbleTheme extends BubbleTheme {
        moreTooltip: any;
        suggestTooltip: any;

        constructor(quill: quill.Quill, options: quill.QuillOptionsStatic) {
          super(quill, options);
          this.moreTooltip = new MoreTooltip(this.quill, this.options.bounds);
          this.suggestTooltip = new SuggestTooltip(this.quill, this.options.bounds);
        }
      }

      Quill.register('themes/bubble-custom', CustomBubbleTheme);
    }
  }

  // Add a 'more' control to Quill
  export class QuillMoreControl {
    constructor() {
      // console.log('qlMoreControl', Quill.imports);

      const Tooltip = Quill.import('ui/tooltip') as typeof QuillTooltip;
      class MoreTooltip extends Tooltip {
        static TEMPLATE = '';

        constructor(quill: quill.Quill, boundsContainer: quill.BoundsStatic) {
          super(quill, boundsContainer);

          this.boundsContainer = boundsContainer || document.body;
          this.quill = quill;
          this.root = quill.addContainer('ql-more-tooltip');
          this.root.innerHTML = MoreTooltip.TEMPLATE;
          let offset = parseInt(window.getComputedStyle(this.root).marginTop);
          this.quill.root.addEventListener('scroll', function () {
            this.root.style.marginTop = (-1 * this.quill.root.scrollTop) + offset + 'px';
          }.bind(this));
          this.root.addEventListener('mousedown', function (event: any) {
            let rect = this.root.getBoundingClientRect();
            if (event.clientX > rect.left && event.clientX < rect.right &&
              event.clientY > rect.top && event.clientY < rect.bottom
            ) {
              this.quill.theme.suggestTooltip.hide();
              event.preventDefault();
            }
          }.bind(this));
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

      Quill.register('ui/more-tooltip', MoreTooltip);

      const Module = Quill.import('core/module') as typeof QuillModule;
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

      Quill.register('modules/more', More);

      class FormatMachine {
        constructor(
          public status: string = undefined,
          public machineHasLearnt: string = undefined
        ) {};
      }

      const Block = Quill.import('blots/block') as typeof Parchment.default.Block;
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

        static create(value: any) {
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
        };

        static formats(node: any) {
          let format = new FormatMachine();
          if (node.hasAttribute('data-status')) {
            format.status = node.getAttribute('data-status');
          }

          if (node.hasAttribute('data-machine-has-learnt')) {
            format.machineHasLearnt = node.getAttribute('data-machine-has-learnt');
          }

          return format;
        };

        static value(node: any) {
          return StateBlock.formats(node);
        };

        format(name: string, value: string) {
          if (name === 'status' || name === 'machineHasLearnt') {
            let attributeName = 'data-' + name;
            if (name === 'machineHasLearnt') {
              attributeName = 'data-machine-has-learnt';
            }

            this.domNode.setAttribute(attributeName, value);
          } else {
            super.format(name, value);
          }
        };

        // noinspection JSUnusedGlobalSymbols
        optimize(context: any) {
          super.optimize(context);
          const Break = Quill.import('blots/break');
          if (this.children.length === 0 ||
            (this.children.length === 1 && this.children.head instanceof Break)
          ) {
            this.formatAt(0, 1, 'block', true);
          }
        };
      }

      Quill.register('blots/state', StateBlock);

      const Scroll = Quill.import('blots/scroll') as typeof Parchment.default.Scroll;
      Scroll.allowedChildren.push(StateBlock);
      Quill.register('blots/scroll', Scroll, true);
    }
  }

  // Add a suggest tooltip to Quill
  export class QuillSuggestTooltip {
    constructor() {
      const Tooltip = Quill.import('ui/tooltip') as typeof QuillTooltip;
      class SuggestTooltip extends Tooltip {
        static TEMPLATE = '<span class="ql-suggest-tooltip-arrow"></span>';

        constructor(quill: quill.Quill, boundsContainer: quill.BoundsStatic) {
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

      Quill.register('ui/suggest-tooltip', SuggestTooltip);

      const Module = Quill.import('core/module') as typeof QuillModule;
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

      Quill.register('modules/suggestions', Suggestions);
    }
  }

}
