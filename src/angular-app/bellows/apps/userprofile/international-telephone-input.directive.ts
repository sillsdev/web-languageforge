import * as angular from 'angular';

export function PuiIntlTelInput(): angular.IDirective {
  return {
    restrict: 'A',
    link(scope, element, attrs) {
      // Create the mobile phone field
      $(element).intlTelInput();

      // Watch the phone number to refresh the country flag
      scope.$watch(attrs.ngModel, (value: string) => {
        if (value != null) {
          $(element).intlTelInput('setNumber', value);
        }
      });
    }
  };
}

export const InternationalTelephoneInputModule = angular
  .module('palaso.ui.intlTelInput', [])
  .directive('puiIntlTelInput', PuiIntlTelInput)
  .name;
