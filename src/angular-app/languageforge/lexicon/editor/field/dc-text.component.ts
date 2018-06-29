import * as angular from 'angular';

export class FieldTextController implements angular.IController {
  fteModel: string;
  fteToolbar: string;
  fteDisabled: boolean;
  fteDisabledReason: string;
  fteMultiline: boolean;
  fteDir: string;

  fte: any = {};
  textFieldValue: string = '';

  static $inject = ['$scope'];
  constructor(private $scope: angular.IScope) { }

  $onInit(): void {
    if (!this.fteMultiline) {
      this.$scope.$watch(() => this.fteModel, (newVal: string) => {
        this.textFieldValue = FieldTextController.unescapeHTML(newVal);
      });
    }

    if (this.fteToolbar != null) {
      this.fte.toolbar = this.fteToolbar;
    } else {
      this.fte.toolbar = '[[]]';
    }
  }

  disabledMsg(): string {
    switch (this.fteDisabledReason) {
      case 'would-lose-metadata':
        return 'This field cannot be edited because it contains metadata that would '
          + 'be lost by editing in Language Forge. Fields with metadata may be edited in '
          + 'FieldWorks Language Explorer.';
      case 'sr-in-progress':
        return 'A Send/Receive is in progress. Any edits made now would be lost. Please '
          + 'wait until the Send/Receive has completed before making further edits.';
      case 'editing-not-permitted':

        // When someone's just an observer on the project, we want NO explanation popup
        return '';
      default:
        return 'This field cannot be edited.';
    }
  }

  inputChanged(): void {
    this.fteModel = FieldTextController.escapeHTML(this.textFieldValue);
  }

  private static unescapeHTML(str: string): string {
    if (str == null) {
      return '';
    }

    return new DOMParser().parseFromString(str, 'text/html').body.textContent;
  }

  private static escapeHTML(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

}

export const FieldTextComponent: angular.IComponentOptions = {
  bindings: {
    fteModel: '=',
    fteToolbar: '<',
    fteDisabled: '<',
    fteDisabledReason: '<',
    fteMultiline: '<',
    fteDir: '<'
  },
  controller: FieldTextController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-text.component.html'
};
