'use strict';

angular.module('palaso.ui.dc.formattedtext', ['bellows.services', 'textAngular'])

// Custom textAngular tool for language spans
.config(['$provide', function ($provide) {

  // add custom tools. Note: $delegate is the taOptions we are decorating
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate',  'taTranslations', 'taTools',
    'sessionService', '$window', '$compile', '$animate',
  function (taRegisterTool, taOptions, taTranslations, taTools,
            ss, $window, $compile, $animate) {

    // register the tool with textAngular
    taRegisterTool('lexInsertLink', {
      //      tooltiptext: taTranslations.lexInsertLink.tooltip,
      tooltiptext: 'Insert/edit link',
      iconclass: 'fa fa-link',
      action: function () {
        var urlLink;
        urlLink = $window.prompt(taTranslations.lexInsertLink.dialogPrompt, 'http://');
        if (urlLink && urlLink !== '' && urlLink !== 'http://') {
          return this.$editor().wrapSelection('createLink', urlLink, true);
        }
      },

      activeState: function (commonElement) {
        if (commonElement) return commonElement[0].tagName === 'A';
        return false;
      },

      onElementSelect: {
        element: 'a',
        action: function (event, $element, editorScope) {

          // setup the editor toolbar
          // Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic
          event.preventDefault();
          editorScope.displayElements.popover.css('width', '435px');
          var container = editorScope.displayElements.popoverContainer;
          container.empty();
          container.css('line-height', '28px');
          var link = angular.element('<a href="' + $element.attr('href') + '" target="_blank">' +
            $element.attr('href') + '</a>');
          link.css({
            display: 'inline-block',
            'max-width': '200px',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
            'vertical-align': 'middle'
          });
          container.append(link);
          var buttonGroup = angular.element('<div class="btn-group pull-right">');
          var reLinkButton = angular.element('<button type="button" ' +
            'class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on">' +
            '<i class="fa fa-edit icon-edit"></i></button>');
          reLinkButton.on('click', function (event) {
            event.preventDefault();
            var urlLink = $window.prompt(taTranslations.lexInsertLink.dialogPrompt,
              $element.attr('href'));
            if (urlLink && urlLink !== '' && urlLink !== 'http://') {
              $element.attr('href', urlLink);
              editorScope.updateTaBindtaTextElement();
            }

            editorScope.hidePopover();
          });

          buttonGroup.append(reLinkButton);
          var unLinkButton = angular.element('<button type="button" ' +
            'class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on">' +
            '<i class="fa fa-unlink icon-unlink"></i></button>');

          // directly before this click event is fired a digest is fired off whereby the reference
          // to $element is orphaned off
          unLinkButton.on('click', function (event) {
            event.preventDefault();
            $element.replaceWith($element.contents());
            editorScope.updateTaBindtaTextElement();
            editorScope.hidePopover();
          });

          buttonGroup.append(unLinkButton);
          var targetToggle = angular.element('<button type="button" ' +
            'class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on">' +
            'Open in New Window</button>');
          if ($element.attr('target') === '_blank') {
            targetToggle.addClass('active');
          }

          targetToggle.on('click', function (event) {
            event.preventDefault();
            $element.attr('target', ($element.attr('target') === '_blank') ? '' : '_blank');
            targetToggle.toggleClass('active');
            editorScope.updateTaBindtaTextElement();
          });

          buttonGroup.append(targetToggle);
          container.append(buttonGroup);
          editorScope.showPopover($element);
        }
      }
    });

    // Written by the author of Rangy
    // see http://stackoverflow.com/questions/4652734/return-html-from-a-user-selected-text
    function getSelectionHtml() {
      var html = '';
      if (typeof window.getSelection != 'undefined') {
        var sel = window.getSelection();
        if (sel.rangeCount) {
          var container = document.createElement('div');
          for (var i = 0, len = sel.rangeCount; i < len; ++i) {
            container.appendChild(sel.getRangeAt(i).cloneContents());
          }

          html = container.innerHTML;
        }
      } else if (typeof document.selection != 'undefined') {
        if (document.selection.type == 'Text') {
          html = document.selection.createRange().htmlText;
        }
      }

      return html;
    }

    taRegisterTool('languageSpan', {
      tooltiptext: 'Create language span',
      iconclass: 'fa fa-language fa-lg',
      action: function createLanguageSpan() {
        var selectedHtml = getSelectionHtml();
        if (selectedHtml && selectedHtml !== '') {
          var languageSpan = '<span lang="">' + selectedHtml + '</span>';
          var element = angular.element(languageSpan);
          var result = this.$editor().wrapSelection('insertHTML', languageSpan, false);
          this.onElementSelect.action(null, element, this.$editor());
          return result;
        }

        return false;
      },

      activeState: function (commonElement) {

        // only works if span is inside another element
        if (commonElement) {
          if (commonElement[0].parentElement.tagName === 'SPAN') return true;
          return commonElement[0].tagName === 'SPAN';
        }

        return false;
      },

      onElementSelect: {
        element: 'span',
        action: function (event, $element, editorScope) {
          var inputSystems = ss.session.projectSettings.config.inputSystems;
          editorScope.selects = {};
          editorScope.selects.language = {};
          editorScope.selects.language.tag = $element.attr('lang');
          editorScope.selects.language.optionsOrder = [];
          editorScope.selects.language.options = {};
          angular.forEach(inputSystems, function (language, tag) {
            var languageName = language.languageName;
            if (languageName === 'Unlisted Language') {
              languageName += ' (' + tag + ')';
            }

            editorScope.selects.language.options[tag] = languageName;
            editorScope.selects.language.optionsOrder.push(tag);
          });

          editorScope.displayElements.popover.css('width', '300px');
          editorScope.displayElements.popover.attr('data-container', 'body');
          editorScope.displayElements.popover.off('mousedown');
          var container = editorScope.displayElements.popoverContainer;
          container.empty();
          container.css('line-height', '28px');
          var langSelect = angular.element(
            '<select data-ng-model="selects.language.tag" ' +
            'data-ng-options="selects.language.options[tag] ' +
            'for tag in selects.language.optionsOrder">' +
            '<option value="">-- choose a language --</option></select>'
          );
          container.append(langSelect);
          var buttonGroup = angular.element('<div class="btn-group pull-right">');
          var unLinkButton = angular.element('<button type="button" ' +
            'class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on">' +
            '<i class="fa fa-unlink icon-unlink"></i></button>');

          // directly before this click event is fired a digest is fired off whereby the reference
          // to $element is orphaned off
          unLinkButton.on('click', function (event) {
            event.preventDefault();
            $element.replaceWith($element.contents());
            editorScope.updateTaBindtaTextElement();
            editorScope.hidePopover();
          });

          buttonGroup.append(unLinkButton);
          container.append(buttonGroup);
          $compile(editorScope.displayElements.popover)(editorScope);

          // change event declared after $compile so that the bindings are in place
          langSelect.on('change', function (event) {
            event.preventDefault();
            $element.attr('lang', editorScope.selects.language.tag);
            editorScope.updateTaBindtaTextElement();
            editorScope.hidePopover();

            console.log('langSelect change: ', $element.attr('lang'));
          });

          if (event) {
            editorScope.$apply();
          }

          // use code below (removes close event) instead of editorScope.showPopover($element);
          editorScope.displayElements.popover.css('display', 'block');
          editorScope.reflowPopover($element);
          $animate.addClass(editorScope.displayElements.popover, 'in');
        }
      }
    });

    // add the button to the default toolbar definition
    taOptions.toolbar[0].push('lexInsertLink', 'languageSpan');

    // disable textAngular indent/outdent so user can tab to next/prev fields
    taOptions.keyMappings = [
      {
        commandKeyCode: 'TabKey',
        testForKey: function () {
          return false;
        }
      },
      {
        commandKeyCode: 'ShiftTabKey',
        testForKey: function () {
          return false;
        }
      }
    ];
    return taOptions;
  }]);

  // add element selector strings that are used to catch click events within a taBind
  $provide.decorator('taSelectableElements', ['$delegate', function (taSelectableElements) {
    taSelectableElements.push('span');
    return taSelectableElements;
  }]);
}])

// Dictionary Control Formatted Text Editor
.directive('dcFormattedtext', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-formattedtext.html',
    scope: {
      fteModel: '=',
      fteToolbar: '=',
      fteDisabled: '=',
      fteMultiline: '=',
      fteDir: '='
    },
    controller: ['$scope', 'sessionService', function ($scope, ss) {
      $scope.fte = {};
      if (angular.isDefined($scope.fteToolbar)) {
        $scope.fte.toolbar = $scope.fteToolbar;
      } else if (ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT)) {

        // if site administrator enable development controls
        //        $scope.fte.toolbar = "[['lexInsertLink', 'languageSpan'], ['html']]";
        // html toggle for development only
        $scope.fte.toolbar = "[['lexInsertLink', 'languageSpan']]";
      } else {
        //        $scope.fte.toolbar = "[['lexInsertLink', 'languageSpan']]";
        // disable unfinished link and language span controls
        $scope.fte.toolbar = '[[]]';
      }

      // x gets sanitised so no default wrap
      $scope.fte.defaultWrap = ($scope.fteMultiline) ? 'p' : 'x';
      $scope.fte.classMultiline = ($scope.fteMultiline) ? 'dc-multiline' : '';

      $scope.setupTaEditor = function setupTaEditor($element) {
        if (!$scope.fteMultiline) {
          $element.on('keydown', function (event) {
            // ignore the enter key
            var key = event.which || event.keyCode;
            if (key === 13) {
              event.preventDefault();
            }
          });
        }
      };
    }]
  };
}]);
