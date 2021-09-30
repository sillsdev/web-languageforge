import * as angular from 'angular';

export class FitTextDirective implements angular.IDirective {

  link(scope: angular.IScope, element: angular.IAugmentedJQuery, attr: angular.IAttributes) {
    let kInput: boolean = false;
    var defaultHeight = 24;
    element.height(40);
    element.css({ 'max-height': '40px' });
    element.css({ height: '40px' });

    function updateHeight(): any {
      let height = element.prop('scrollHeight');
      element.height = height;
      element.css({ 'max-height': height + 'px' });
      element.css({ height: height + 'px' });
      updateContainersHeight();
    }

    function updateContainersHeight(): any {
      var wHeight = angular.element(window).height();
      var editorTitleTextElement = angular.element(document).find('#editor-title-text');
      var tHeight = editorTitleTextElement.height();
      var primaryNavigationElement = angular.element(document).find('#primary-navigation');
      var primaryNavigationHeight = primaryNavigationElement.height();
      var scrollingEditorContainerElement = angular.element(document).find('#scrolling-editor-container');

      var adjHeight = wHeight - (tHeight - defaultHeight);
      var sHeight = adjHeight - (177 + primaryNavigationHeight);
      var lHeight = adjHeight - (447 + primaryNavigationHeight);
      scrollingEditorContainerElement.css({ height: sHeight + 'px' });
    }

    element.on('keyup', () => {
      kInput = true;
      scope.$apply(() => {
        updateHeight();
      });
    });

    angular.element(window).on('resize',() => { 
      updateHeight();
    });

    scope.$watch(() => {
      if (!kInput){
        kInput = false;
        updateHeight();
      }
    });

  }

  static factory(): angular.IDirectiveFactory {
    return () => new FitTextDirective();
  }

}

