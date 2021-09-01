import * as angular from 'angular';

export class FitTextDirective implements angular.IDirective {

  link(scope: angular.IScope, element: angular.IAugmentedJQuery, attr: angular.IAttributes) {
    let kInput: boolean = false;
    function updateHeight(): any {
      let height = element.prop('scrollHeight');
      element.height = height;
      element.css({ 'max-height': height + 'px' });
      element.css({ height: height + 'px' });
    }
    element.on('keyup', () => {
      kInput = true;
      scope.$apply(() => {
        updateHeight();
      });
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
