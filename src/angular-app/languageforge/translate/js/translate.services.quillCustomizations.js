'use strict';

angular.module('translate.services')

  // ensure service is eager loaded (rather than lazy loaded)
  .run(['qlCustomTheme', function () {}])

  // Customize the Bubble theme in Quill
  .service('qlCustomTheme', ['qlMoreControl', 'qlSuggestTooltip', function () {
    var MoreTooltip = Quill.import('ui/more-tooltip');
    var SuggestTooltip = Quill.import('ui/suggest-tooltip');
    var BubbleTheme = Quill.import('themes/bubble');
    function CustomBubbleTheme(quill, options) {
      BubbleTheme.call(this, quill, options);
      this.moreTooltip = new MoreTooltip(this.quill, this.options.bounds);
      this.suggestTooltip = new SuggestTooltip(this.quill, this.options.bounds);
    }

    CustomBubbleTheme.prototype = Object.create(BubbleTheme.prototype);
    CustomBubbleTheme.prototype.constructor = CustomBubbleTheme;
    Quill.register('themes/bubble-custom', CustomBubbleTheme);

    /**
     * @param {string} text
     * @returns {string}
     */
    Quill.removeTrailingCarriageReturn = function removeTrailingCarriageReturn(text) {
      return (text.endsWith('\n')) ? text.substr(0, text.length - 1) : text;
    };

    /**
     * @param {string} text
     * @returns {boolean}
     */
    Quill.isTextEmpty = function (text) {
      return !Quill.removeTrailingCarriageReturn(text);
    };

    /**
     * @returns {boolean}
     */
    Quill.prototype.isTextEmpty = function isTextEmpty() {
      return !Quill.removeTrailingCarriageReturn(this.getText());
    };

    /**
     * @param range
     * @returns {boolean}
     */
    Quill.hasNoSelectionAtCursor = function (range) {
      return range && range.length === 0;
    };

    /**
     * @returns {boolean}
     */
    Quill.prototype.hasNoSelectionAtCursor = function hasNoSelectionAtCursor() {
      var range = this.getSelection();
      return range && range.length === 0;
    };
  }])

  // Add a 'more' control to Quill
  .service('qlMoreControl', ['es5Super', function (es5Super) {
    // console.log('qlMoreControl', Quill.imports);

    var Tooltip = Quill.import('ui/tooltip');
    function MoreTooltip(quill, boundsContainer) {
      //noinspection JSUnusedGlobalSymbols
      this.boundsContainer = boundsContainer || document.body;
      this.quill = quill;
      this.root = quill.addContainer('ql-more-tooltip');
      this.root.innerHTML = this.constructor.TEMPLATE;
      var offset = parseInt(window.getComputedStyle(this.root).marginTop);
      this.quill.root.addEventListener('scroll', function () {
        this.root.style.marginTop = (-1 * this.quill.root.scrollTop) + offset + 'px';
      }.bind(this));
      this.root.addEventListener('mousedown', function (event) {
        var rect = this.root.getBoundingClientRect();
        if (event.clientX > rect.left && event.clientX < rect.right &&
          event.clientY > rect.top && event.clientY < rect.bottom
        ) {
          this.quill.theme.suggestTooltip.hide();
          event.preventDefault();
        }
      }.bind(this));
      this.hide();
    }

    MoreTooltip.TEMPLATE = '';
    MoreTooltip.prototype = Object.create(Tooltip.prototype);
    MoreTooltip.prototype.constructor = MoreTooltip;
    MoreTooltip.prototype.position = function (reference) {
      var top = reference.top + this.quill.root.scrollTop +
        (reference.height - this.root.clientHeight) / 2;
      this.root.style.top = top + 'px';
      this.root.style.left = this.quill.root.clientWidth + 2 * this.quill.root.offsetLeft
        - this.root.clientWidth + 'px';
    };

    Quill.register('ui/more-tooltip', MoreTooltip);

    var Module = Quill.import('core/module');
    function More(quill, options) {
      Module.call(this, quill, options);

      // initially container is sibling of <ng-quill-editor>
      this.container = quill.container.parentNode.parentNode.querySelector(options.container);
      quill.theme.moreTooltip.root.appendChild(this.container);
    }

    More.prototype = Object.create(Module.prototype);
    More.prototype.constructor = More;
    Quill.register('modules/more', More);

    var Block = Quill.import('blots/block');
    function StateBlock(domNode) {
      Block.call(this, domNode);
    }

    StateBlock.prototype = Object.create(Block.prototype);
    StateBlock.prototype.constructor = StateBlock;
    StateBlock.blotName = 'state';
    StateBlock.className = Block.className;
    StateBlock.tagName = Block.tagName;
    StateBlock.scope = Block.scope;
    StateBlock.allowedChildren = Block.allowedChildren;
    StateBlock.defaultChild = Block.defaultChild;
    StateBlock.create = function (value) {
      var node = es5Super.getStatic(Block, 'create', this).call(this);
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

    StateBlock.formats = function (node) {
      var format = {};
      if (node.hasAttribute('data-status')) {
        format.status = node.getAttribute('data-status');
      }

      if (node.hasAttribute('data-machine-has-learnt')) {
        format.machineHasLearnt = node.getAttribute('data-machine-has-learnt');
      }

      return format;
    };

    StateBlock.value = function (node) {
      return StateBlock.formats(node);
    };

    StateBlock.prototype.format = function (name, value) {
      if (name === 'status' || name === 'machineHasLearnt') {
        var attributeName = 'data-' + name;
        if (name === 'machineHasLearnt') {
          attributeName = 'data-machine-has-learnt';
        }

        this.domNode.setAttribute(attributeName, value);
      } else {
        es5Super.get(StateBlock, 'format', this).call(this, name, value);
      }
    };

    StateBlock.prototype.optimize = function () {
      es5Super.get(StateBlock, 'optimize', this).call(this);
      var Break = Quill.import('blots/break');
      if (this.children.length === 0 ||
        (this.children.length === 1 && this.children.head instanceof Break)
      ) {
        this.formatAt(0, 1, 'block', true);
      }
    };

    Quill.register('blots/state', StateBlock);

    var Scroll = Quill.import('blots/scroll');
    Scroll.allowedChildren.push(StateBlock);
    Quill.register('blots/scroll', Scroll, true);
  }])

  // Add a suggest tooltip to Quill
  .service('qlSuggestTooltip', ['es5Super', function (es5Super) {
    var Tooltip = Quill.import('ui/tooltip');
    function SuggestTooltip(quill, boundsContainer) {
      //noinspection JSUnusedGlobalSymbols
      this.boundsContainer = boundsContainer || document.body;
      this.quill = quill;
      this.root = quill.addContainer('ql-suggest-tooltip');
      this.root.innerHTML = this.constructor.TEMPLATE;
      var offset = parseInt(window.getComputedStyle(this.root).marginTop);
      this.quill.root.addEventListener('scroll', function () {
        this.root.style.marginTop = (-1 * this.quill.root.scrollTop) + offset + 'px';
      }.bind(this));
      this.hide();
    }

    SuggestTooltip.TEMPLATE = '<span class="ql-suggest-tooltip-arrow"></span>';
    SuggestTooltip.prototype = Object.create(Tooltip.prototype);
    SuggestTooltip.prototype.constructor = SuggestTooltip;
    SuggestTooltip.prototype.position = function (reference) {
      var shift = es5Super.get(SuggestTooltip, 'position', this).call(this, reference);
      var top = reference.bottom + this.quill.root.scrollTop + 10;
      this.root.style.top = top + 'px';
      var arrow = this.root.querySelector('.ql-suggest-tooltip-arrow');
      arrow.style.marginLeft = '';
      if (shift === 0) return shift;
      arrow.style.marginLeft = (-1 * shift - arrow.offsetWidth / 2) + 'px';
    };

    Quill.register('ui/suggest-tooltip', SuggestTooltip);

    var Module = Quill.import('core/module');
    function Suggestions(quill, options) {
      Module.call(this, quill, options);

      // initially container is sibling of <ng-quill-editor>
      this.container = quill.container.parentNode.parentNode.querySelector(options.container);
      quill.theme.suggestTooltip.root.appendChild(this.container);
    }

    Suggestions.prototype = Object.create(Module.prototype);
    Suggestions.prototype.constructor = Suggestions;

    Quill.register('modules/suggestions', Suggestions);
  }])

  .service('es5Super', [function () {
    /**
     * Gets the parent (super class) function to call
     * @param objectClass
     * @param property
     * @param receiver
     * @returns {*}
     */
    this.get = function getSuper(objectClass, property, receiver) {
      var object = objectClass.prototype.__proto__ || Object.getPrototypeOf(objectClass.prototype);
      return _get(object, property, receiver);
    };

    /**
     * Gets the parent (super class) static function to call
     * @param objectClass
     * @param property
     * @param receiver
     * @returns {*}
     */
    this.getStatic = function getStaticSuper(objectClass, property, receiver) {
      var object = objectClass.__proto__ || Object.getPrototypeOf(objectClass);
      return _get(object, property, receiver);
    };

    /**
     * from quill.js _get function
     * @param object
     * @param property
     * @param receiver
     * @returns {*}
     */
    function _get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);
      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) return undefined;

        return _get(parent, property, receiver);
      } else if ('value' in desc) {
        return desc.value;
      } else {
        var getter = desc._get;
        if (getter === undefined) return undefined;

        return getter.call(receiver);
      }
    }

  }])

  ;
