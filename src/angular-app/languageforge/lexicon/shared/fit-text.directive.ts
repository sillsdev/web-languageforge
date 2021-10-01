import * as angular from 'angular';

export class FitTextDirective implements angular.IDirective {

  link(scope: angular.IScope, element: angular.IAugmentedJQuery, attr: angular.IAttributes) {
    function updateHeight(): void {
        let el = element[0] as HTMLTextAreaElement;
      	el.style.height = "10px";
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

    scope.$watch(() => {
      updateHeight();
    });
  }

  static factory(): angular.IDirectiveFactory {
    return () => new FitTextDirective();
  }

}

