import * as angular from 'angular';

export class FitTextDirective implements angular.IDirective {

  link(scope: angular.IScope, element: angular.IAugmentedJQuery, attr: angular.IAttributes) {
    function updateHeight(): void {

        // element is a JQuery object, and element[0] is the textarea DOM object
        // the DOM object is the only way we can access the calculated "scrollHeight",
        // since the JQuery object doesn't have that property
        let el = element[0] as HTMLTextAreaElement;

        // start with a small minimum height
      	el.style.height = "10px";

        // grow to the height necessary to fit all the text
        el.style.height = el.scrollHeight+"px";
    }

    element.on('keyup', () => {
      scope.$apply(() => {
        updateHeight();
      });
    });

    angular.element(window).on('resize',() => {
      updateHeight();
    });

    // this is required in order to resize the text area when switching between entries
    scope.$watch(() => {
      updateHeight();
    });
  }

  static factory(): angular.IDirectiveFactory {
    return () => new FitTextDirective();
  }

}

