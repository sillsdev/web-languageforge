'use strict';

angular.module('translate.services')

  // ensure service is eager loaded (rather than lazy loaded)
  .run(['qlSuggestTooltip', function () {}])

  // Add a suggest tooltip to Quill
  .service('qlSuggestTooltip', [function () {
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
      var shift = getSuper(SuggestTooltip, 'position', this).call(this, reference);
      var top = reference.bottom + this.quill.root.scrollTop + 10;
      this.root.style.top = top + 'px';
      var arrow = this.root.querySelector('.ql-suggest-tooltip-arrow');
      arrow.style.marginLeft = '';
      if (shift === 0) return shift;
      arrow.style.marginLeft = (-1 * shift - arrow.offsetWidth / 2) + 'px';
    };

    var BubbleTheme = Quill.import('themes/bubble');
    function SuggestBubbleTheme(quill, options) {
      BubbleTheme.call(this, quill, options);
      this.suggestTooltip = new SuggestTooltip(this.quill, this.options.bounds);
    }

    SuggestBubbleTheme.prototype = Object.create(BubbleTheme.prototype);
    SuggestBubbleTheme.prototype.constructor = SuggestBubbleTheme;
    SuggestBubbleTheme.prototype._super = BubbleTheme;

    var Module = Quill.import('core/module');
    function Suggestions(quill, options) {
      Module.call(this, quill, options);

      // initially container is sibling of <ng-quill-editor>
      this.container = quill.container.parentNode.parentNode.querySelector(options.container);
      quill.theme.suggestTooltip.root.appendChild(this.container);
    }

    Suggestions.prototype = Object.create(Module.prototype);
    Suggestions.prototype.constructor = Suggestions;

    Quill.register('ui/suggest-tooltip', SuggestTooltip);
    Quill.register('themes/bubble-suggest', SuggestBubbleTheme);
    Quill.register('modules/suggestions', Suggestions);

    /**
     * Gets the parent (super class) function to call
     * from quill.js _get
     * @param objectClass
     * @param property
     * @param receiver
     * @returns {*}
     */
    function getSuper(objectClass, property, receiver) {
      var object = objectClass.prototype.__proto__ || Object.getPrototypeOf(objectClass.prototype);
      return get(object, property, receiver);
    }

    function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);
      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) return undefined;

        return get(parent, property, receiver);
      } else if ('value' in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === undefined) return undefined;

        return getter.call(receiver);
      }
    }

    return 'qlSuggestTooltip service loaded';
  }])

  ;
