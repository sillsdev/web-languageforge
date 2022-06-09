import * as angular from 'angular';
import 'ng-drag-to-reorder';

interface Item {
  key: string;
  value: string;
}

export class PickListEditorController implements angular.IController {
  items: Item[];
  defaultKey: string;

  get showDefault(): boolean { return this.defaultKey != null; }
  newValue: string;

  private isDeletable: { [key: string]: boolean } = {};

  $onChanges(changes: angular.IOnChangesObject): void {
    // Ensure this.items is always an array even if it was missing in the input data
    const itemsChangeObj = changes.items as angular.IChangesObject<Item[]>;
    if (itemsChangeObj != null) {
      if (itemsChangeObj.currentValue == null) {
        this.items = [];
      }
    }
  }

  pickAddItem(): void {
    if (this.newValue) {
      const key = PickListEditorController.keyFromValue(this.newValue);
      this.items.push({ key, value: this.newValue });
      this.isDeletable[key] = true;
      this.newValue = undefined;
    }
  }

  pickRemoveItem(index: number): void {
    delete this.isDeletable[this.items[index].key];
    this.items.splice(index, 1);
  }

  // only unsaved items can be removed
  // TODO: implement search and replace to allow remove on any item. IJH 2015-03
  showRemove(index: number): boolean {
    const key = this.items[index].key;
    return key in this.isDeletable && this.isDeletable[key];
  }

  // noinspection JSMethodCanBeStatic
  blur(elem: HTMLElement): void {
    elem.blur();
  }

  static keyFromValue(value: string): string {
    return value.replace(/ /gi, '_');
  }

}

export const PickListEditorComponent: angular.IComponentOptions = {
  bindings: {
    items: '=',
    defaultKey: '=?'
  },
  controller: PickListEditorController,
  templateUrl: '/angular-app/bellows/shared/pick-list-editor.component.html'
};

export function OnEnter(): angular.IDirective {
  return {
    restrict: 'A',
    link(scope, elem, attrs) {
      elem.bind('keydown keypress', (evt: Event) => {
        if ((evt as KeyboardEvent).which === 13) {
          scope.$apply(() => {
            scope.$eval(attrs.onEnter, { thisElement: elem, event: evt });
          });

          evt.preventDefault();
        }
      });
    }
  };
}

// see http://stackoverflow.com/questions/17089090/prevent-input-from-setting-form-dirty-angularjs
export function NoDirtyCheck(): angular.IDirective {
  // Interacting with input elements having this directive won't cause the form to be marked dirty.
  return {
    restrict: 'A',
    require: 'ngModel',
    link(scope, elm, attrs, ctrl: angular.INgModelController) {
      elm.focus(() => {
        ctrl.$pristine = false;
      });
    }
  };
}

export const PickListEditorModule = angular
  .module('palaso.ui.picklistEditor', ['ngDragToReorder'])
  .component('picklistEditor', PickListEditorComponent)
  .directive('onEnter', OnEnter)
  .directive('noDirtyCheck', NoDirtyCheck)
  .name;
