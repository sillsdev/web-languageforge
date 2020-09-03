import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { NgbRadio } from '@ng-bootstrap/ng-bootstrap';
import * as angular from 'angular';

import {CaptchaItem} from './model/captcha.model';

// Old AngularJS component code was:
// export class CaptchaController implements angular.IController {
//   puiItems: CaptchaItem[];
//   puiExpectedItemName: string;
//   puiSelected: string;

//   record = {
//     selected: this.puiSelected
//   };

//   static $inject: string[] = ['$scope'];
//   constructor(private $scope: angular.IScope) { }

//   $onInit(): void {
//     this.$scope.$watch(() => this.record.selected, (newValue: string, oldValue: string) => {
//       if (newValue !== oldValue) {
//         this.puiSelected = this.record.selected;
//       }
//     });
//   }

//   $onChanges(changes: any): void {
//     const selectedChange = changes.puiSelected as angular.IChangesObject<string>;
//     if (selectedChange != null && selectedChange.currentValue &&
//       selectedChange.currentValue !== this.record.selected
//     ) {
//       this.record.selected = this.puiSelected;
//     }
//   }

// }

@Component({
  templateUrl: 'captcha.component.html',
  inputs: ['puiItems', 'puiExpectedItemName', 'puiSelected']
})
export class CaptchaComponent implements OnChanges {
  // TODO: Should we receive CaptchaData instead of separate Items and ExpectedItemName?
  puiItems: CaptchaItem[];
  puiExpectedItemName: string;
  puiSelected: number;

  ngOnChanges(changes: SimpleChanges): void {
    const old = changes.puiSelected.previousValue;
    const now = changes.puiSelected.currentValue;
    console.log('Old: ', old, 'Now: ', now);
  }

}

export const CaptchaModule = angular
  .module('palaso.ui.captcha', [])
  .directive('puiCaptcha', downgradeComponent({component: CaptchaComponent}) as angular.IDirectiveFactory)
  .name;
