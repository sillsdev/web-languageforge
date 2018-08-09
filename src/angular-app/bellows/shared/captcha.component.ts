import * as angular from 'angular';

import {CaptchaItem} from './model/captcha.model';

export class CaptchaController implements angular.IController {
  puiItems: CaptchaItem[];
  puiExpectedItemName: string;
  puiSelected: string;

  record = {
    selected: this.puiSelected
  };

  static $inject: string[] = ['$scope'];
  constructor(private $scope: angular.IScope) { }

  $onInit(): void {
    this.$scope.$watch(() => this.record.selected, (newValue: string, oldValue: string) => {
      if (newValue !== oldValue) {
        this.puiSelected = this.record.selected;
      }
    });
  }

  $onChanges(changes: any): void {
    const selectedChange = changes.puiSelected as angular.IChangesObject<string>;
    if (selectedChange != null && selectedChange.currentValue &&
      selectedChange.currentValue !== this.record.selected
    ) {
      this.record.selected = this.puiSelected;
    }
  }

}

export const CaptchaComponent: angular.IComponentOptions = {
  bindings: {
    puiItems: '<',
    puiExpectedItemName: '<',
    puiSelected: '='
  },
  controller: CaptchaController,
  templateUrl: '/angular-app/bellows/shared/captcha.component.html'
};

export const CaptchaModule = angular
  .module('palaso.ui.captcha', [])
  .component('puiCaptcha', CaptchaComponent)
  .name;
