import * as angular from 'angular';

import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {NoticeService} from '../../../../bellows/core/notice/notice.service';
import {LexiconConfig} from '../../shared/model/lexicon-config.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';
import {OptionSelects} from './option-selects.model';

export class InputSystemsConfigurationController implements angular.IController {
  iscInputSystemViewModels: { [inputSystemId: string]: ConfigurationInputSystemsViewModel };
  iscInputSystemsList: ConfigurationInputSystemsViewModel[];
  readonly iscConfigPristine: LexiconConfig;
  iscAddInputSystem: boolean;
  iscOnUpdate: (params: { $event: {
    inputSystemViewModels?: { [inputSystemId: string]: ConfigurationInputSystemsViewModel },
    inputSystemsList?: ConfigurationInputSystemsViewModel[],
    addInputSystem?: boolean
  } }) => void;

  selectedInputSystemId: string = '';
  suggestedLanguageCodes = {};
  readonly selects = new OptionSelects();

  private inputSystemSelected: boolean = true;

  static $inject: string[] = ['$scope', '$uibModal', 'silNoticeService'];
  constructor(private $scope: angular.IScope, private $modal: ModalService, private notice: NoticeService) { }

  $onChanges(changes: any): void {
    const listChange = changes.iscInputSystemsList as angular.IChangesObject<ConfigurationInputSystemsViewModel[]>;
    if (listChange != null && listChange.previousValue !== listChange.currentValue &&
      listChange.currentValue != null
    ) {
      this.selectInputSystem(this.iscInputSystemsList[0].uuid);
      if (listChange.isFirstChange()) {
        this.$scope.$watchCollection(() => this.iscInputSystemViewModels[this.selectedInputSystemId],
          (newValue: ConfigurationInputSystemsViewModel, oldValue: ConfigurationInputSystemsViewModel) => {
            if (angular.isUndefined(newValue) || angular.isUndefined(oldValue) ||
              angular.equals(oldValue, newValue)
            ) {
              return;
            }

            if (this.inputSystemSelected) {
              this.inputSystemSelected = false;
              return;
            }

            newValue.buildTag();
            this.iscOnUpdate({ $event: { inputSystemViewModels: this.iscInputSystemViewModels } });
          }
        );
      }
    }

    const addInputSystemChange = changes.iscAddInputSystem as angular.IChangesObject<boolean>;
    if (addInputSystemChange != null && addInputSystemChange.currentValue) {
      this.openNewLanguageModal(this.suggestedLanguageCodes);
      this.iscOnUpdate({ $event: {
        addInputSystem: false
      } });
    }
  }

  isInputSystemInUse(): boolean {
    if (this.iscInputSystemViewModels == null || !(this.selectedInputSystemId in this.iscInputSystemViewModels)) {
      return true;
    }

    return (this.iscInputSystemViewModels[this.selectedInputSystemId].inputSystem.tag in
      this.iscConfigPristine.inputSystems);
  }

  newExists(special: string): boolean {
    if (this.iscInputSystemViewModels == null || !(this.selectedInputSystemId in this.iscInputSystemViewModels)) {
      return false;
    }

    const viewModel = new ConfigurationInputSystemsViewModel(this.selects);
    viewModel.language = this.iscInputSystemViewModels[this.selectedInputSystemId].language;
    viewModel.special = special;
    viewModel.buildTag();
    for (const uuid in this.iscInputSystemViewModels) {
      if (this.iscInputSystemViewModels.hasOwnProperty(uuid) &&
        this.iscInputSystemViewModels[uuid].inputSystem.tag === viewModel.inputSystem.tag
      ) {
        return true;
      }
    }

    return false;
  }

  addInputSystem(code: string, languageName: string, special: string): void {
    const viewModel = new ConfigurationInputSystemsViewModel(this.selects, {
      tag: code,
      languageName,
      abbreviation: code
    });
    viewModel.special = special;
    viewModel.buildTag();

    // Verify newly created tag doesn't already exist before adding it to the list
    for (const uuid in this.iscInputSystemViewModels) {
      if (this.iscInputSystemViewModels.hasOwnProperty(uuid) && special !== this.selects.special.optionsOrder[3] &&
        this.iscInputSystemViewModels[uuid].inputSystem.tag === viewModel.inputSystem.tag
      ) {
        this.notice.push(this.notice.ERROR, 'Input system for ' + viewModel.inputSystem.languageName +
          ' already exists');
        return;
      }
    }

    this.iscInputSystemViewModels[viewModel.uuid] = viewModel;
    this.iscInputSystemsList.push(viewModel);
    this.selectedInputSystemId = viewModel.uuid;
    this.iscOnUpdate({ $event: {
        inputSystemViewModels: this.iscInputSystemViewModels,
        inputSystemsList: this.iscInputSystemsList
      } });
  }

  selectInputSystem(id: string): void {
    this.selectedInputSystemId = id;
    this.inputSystemSelected = true;
  }

  removeInputSystem(selectedInputSystemId: string): void {
    const viewModel = this.iscInputSystemViewModels[selectedInputSystemId];
    const index = this.iscInputSystemsList.indexOf(viewModel);
    if (index > -1) {
      this.iscInputSystemsList.splice(index, 1);
    }

    delete this.iscInputSystemViewModels[selectedInputSystemId];
    this.iscOnUpdate({ $event: {
        inputSystemViewModels: this.iscInputSystemViewModels,
        inputSystemsList: this.iscInputSystemsList
      } });

    // select the first items
    this.selectInputSystem(this.iscInputSystemsList[0].uuid);
  }

  isUnlistedLanguage(code: string): boolean {
    return (code === 'qaa');
  }

  openNewLanguageModal(suggestedLanguageCodes: any): void {
    const modalInstance = this.$modal.open({
      templateUrl: '/angular-app/languageforge/lexicon/shared/select-new-language.html',
      windowTopClass: 'modal-select-language',
      controller: ['$scope', '$uibModalInstance',
        (scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          scope.selected = {
            code: '',
            language: {}
          };
          scope.add = () => {
            $modalInstance.close(scope.selected);
          };

          scope.close = $modalInstance.dismiss;

          scope.suggestedLanguageCodes = suggestedLanguageCodes;
        }
      ]
    });

    modalInstance.result.then((selected: any) => {
      this.addInputSystem(selected.code, selected.language.name,
        this.selects.special.optionsOrder[0]);
    });

  }

}

export const InputSystemsConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    iscInputSystemViewModels: '<',
    iscInputSystemsList: '<',
    iscConfigPristine: '<',
    iscAddInputSystem: '<',
    iscOnUpdate: '&'
  },
  controller: InputSystemsConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-input-systems.component.html'
};
