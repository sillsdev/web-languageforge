'use strict';

angular.module('palaso.ui.dc.formattedtext', ['bellows.services', 'textAngular'])

// Custom textAngular tool for language spans
.config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate',  '$window', 'taTranslations', 'sessionService', 
  function(taRegisterTool, taOptions, $window, taTranslations, ss) {

    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('insert_link', {
//      tooltiptext: taTranslations.insertLink.tooltip,
      tooltiptext: 'Insert/edit link',
      iconclass: 'fa fa-link',
      action: function() {
        var urlLink;
        urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, 'http://');
        if (urlLink && urlLink !== '' && urlLink !== 'http://') {
          return this.$editor().wrapSelection('createLink', urlLink, true);
        }
      },
      activeState: function(commonElement) {
        if (commonElement) return commonElement[0].tagName === 'A';
        return false;
      },
      onElementSelect: {
        element: 'a',
        action: function(event, $element, editorScope) {

          // setup the editor toolbar
          // Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic
          event.preventDefault();
          editorScope.displayElements.popover.css('width', '435px');
          var container = editorScope.displayElements.popoverContainer;
          container.empty();
          container.css('line-height', '28px');
          var link = angular.element('<a href="' + $element.attr('href') + '" target="_blank">' + $element.attr('href') + '</a>');
          link.css({
            'display': 'inline-block',
            'max-width': '200px',
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
            'vertical-align': 'middle'
          });
          container.append(link);
          var buttonGroup = angular.element('<div class="btn-group pull-right">'),
              reLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on"><i class="fa fa-edit icon-edit"></i></button>');
          reLinkButton.on('click', function(event) {
            event.preventDefault();
            var urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, $element.attr('href'));
            if (urlLink && urlLink !== '' && urlLink !== 'http://') {
              $element.attr('href', urlLink);
              editorScope.updateTaBindtaTextElement();
            }
            editorScope.hidePopover();
          });
          buttonGroup.append(reLinkButton);
          var unLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on"><i class="fa fa-unlink icon-unlink"></i></button>');

          // directly before this click event is fired a digest is fired off whereby the reference to $element is orphaned off
          unLinkButton.on('click', function(event) {
            event.preventDefault();
            $element.replaceWith($element.contents());
            editorScope.updateTaBindtaTextElement();
            editorScope.hidePopover();
          });
          buttonGroup.append(unLinkButton);
          var targetToggle = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on">Open in New Window</button>');
          if ($element.attr('target') === '_blank') {
            targetToggle.addClass('active');
          }
          targetToggle.on('click', function(event) {
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

    // Written by the author of Rangy, see http://stackoverflow.com/questions/4652734/return-html-from-a-user-selected-text
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
    
    function getLanguageTag() {
      return 'test';
    }

    taRegisterTool('languageSpan', {
      tooltiptext: 'Create language span',
      iconclass: 'fa fa-language fa-lg',
      action: function createLanguageSpan() {
        var selectedHtml = getSelectionHtml(),
            languageTag = getLanguageTag();
        if (languageTag && languageTag !== '' && selectedHtml && selectedHtml !== '') {
          var languageSpan = '<span lang="' + languageTag + '">' + selectedHtml + '</span>';
          return this.$editor().wrapSelection('insertHTML', languageSpan, false);
        }
      },
      activeState: function(commonElement){
        if(commonElement) {
          if (commonElement[0].parentElement.tagName === 'SPAN') return true;
          return commonElement[0].tagName === 'SPAN';
        }
        return false;
      },
      onElementSelect: {
        element: 'span',
        action: function(event, $element, editorScope) {
          var languageTag = $element.attr('lang'),
              inputSystems = ss.session.projectSettings.config.inputSystems;
          editorScope.selects = {};
          editorScope.selects.languageTag = $element.attr('lang');
          editorScope.selects.language = {};
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
          
          console.log('select language span', $element, editorScope, languageTag);

          editorScope.displayElements.popover.css('width', '300px');
          var container = editorScope.displayElements.popoverContainer;
          container.empty();
          container.css('line-height', '28px');
          var langSelect = angular.element(
                '<select ng-model="selects.languageTag"' +
                  'ng-options="selects.language.options[tag] for tag in selects.language.optionsOrder">' +
                  '<option value="">-- choose a language --</option></select>'
              );

          langSelect.css({
            'display': 'inline-block',
//            'max-width': '200px',
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
            'vertical-align': 'middle'
          });
          container.append(langSelect);
          var buttonGroup = angular.element('<div class="btn-group pull-right">'),
              unLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on"><i class="fa fa-unlink icon-unlink"></i></button>');

          // directly before this click event is fired a digest is fired off whereby the reference to $element is orphaned off
          unLinkButton.on('click', function(event) {
            event.preventDefault();
            $element.replaceWith($element.contents());
            editorScope.updateTaBindtaTextElement();
            editorScope.hidePopover();
          });
          buttonGroup.append(unLinkButton);
          container.append(buttonGroup);
          editorScope.showPopover($element);
        }
      }
    });

    // add the button to the default toolbar definition
    taOptions.toolbar[0].push('languageSpan');
    return taOptions;
  }]);
  
  $provide.decorator('taSelectableElements', ['$delegate', function(taSelectableElements) {
    taSelectableElements.push('span');
    return taSelectableElements;
  }]);
})

// Dictionary Control Formatted Text Editor
.directive('dcFormattedtext', [function() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-formattedtext.html',
    scope: {
      fteModel: "=",
      fteLanguageName: "=",
      fteAbbreviation: "=",
      fteToolbar: "=",
      fteDisabled: "=",
      fteDir: "="
    },
    controller: ['$scope', 'sessionService', function($scope, ss) {
      var inputSystems = ss.session.projectSettings.config.inputSystems;
      
      $scope.fte = {};
      if (angular.isDefined($scope.fteToolbar)) {
        $scope.fte.toolbar = $scope.fteToolbar;
      } else if (ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT)) {
        $scope.fte.toolbar = "[['insert_link', 'languageSpan'], ['html']]";
      } else {
        $scope.fte.toolbar = "[['insert_link', 'languageSpan']]";
      }
      
      $scope.selects = {};
      $scope.selects.language = {};
      $scope.selects.language.optionsOrder = [];
      $scope.selects.language.options = {};
      angular.forEach(inputSystems, function (language, tag) {
        var languageName = language.languageName;
        if (languageName === 'Unlisted Language') {
          languageName += ' (' + tag + ')';
        }
        $scope.selects.language.options[tag] = languageName;
        $scope.selects.language.optionsOrder.push(tag);
      });
    }]
  };
}]);
