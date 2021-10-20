import * as angular from 'angular';

import {ApplicationHeaderService} from '../../../../bellows/core/application-header.service';
import {NoticeService} from '../../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../../bellows/core/session.service';
import {User} from '../../../../bellows/shared/model/user.model';
import {LexiconProjectService} from '../../core/lexicon-project.service';
import {LexiconSendReceiveService} from '../../core/lexicon-send-receive.service';
import {
  LexConfigField, LexConfigFieldList, LexiconConfig
} from '../../shared/model/lexicon-config.model';
import {LexiconProjectSettings} from '../../shared/model/lexicon-project-settings.model';
import {LexOptionList} from '../../shared/model/option-list.model';
import {ConfigurationFieldUnifiedViewModel} from './field-unified-view.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';
import {OptionSelects} from './option-selects.model';

interface LexiconConfigControllerScope extends angular.IScope {
  configForm: angular.IFormController;
}

export class LexiconConfigurationController implements angular.IController {
  lscConfig: LexiconConfig;
  lscOptionLists: LexOptionList[];
  lscUsers: { [userId: string]: User } = {};
  lscOnUpdate: (params: { $event: { config?: LexiconConfig, optionLists?: LexOptionList[] } }) => void;

  activeTab = ConfigurationTab.Fields;
  addInputSystem = false;
  isSaving = false;
  readonly selects = new OptionSelects();

  configDirty: LexiconConfig;
  configPristine: LexiconConfig;
  fieldConfig: { [fieldName: string]: LexConfigField };
  inputSystemViewModels: { [inputSystemId: string]: ConfigurationInputSystemsViewModel };
  inputSystemsList: ConfigurationInputSystemsViewModel[];
  unifiedViewModel: ConfigurationFieldUnifiedViewModel;
  optionListsDirty: LexOptionList[];
  optionListsPristine: LexOptionList[];

  private unifiedViewModelPristine: ConfigurationFieldUnifiedViewModel;
  private warnOfUnsavedEditsId: string;

  static $inject: string[] = ['$scope', '$q',
    'silNoticeService', 'sessionService',
    'lexProjectService', 'lexSendReceive',
    'applicationHeaderService'];
  constructor(private $scope: LexiconConfigControllerScope, private $q: angular.IQService,
              private notice: NoticeService, private sessionService: SessionService,
              private lexProjectService: LexiconProjectService, private sendReceive: LexiconSendReceiveService,
              private applicationHeaderService: ApplicationHeaderService) { }

  $onInit(): void {
    this.lexProjectService.setBreadcrumbs('configuration', 'Configuration');
    this.lexProjectService.setupSettings();
    this.applicationHeaderService.setPageName('Configuration');

    this.sendReceive.setPollUpdateSuccessCallback(this.pollUpdateSuccess);
    this.sendReceive.setSyncProjectStatusSuccessCallback(this.syncProjectStatusSuccess);
  }

  $onChanges(changes: any): void {
    const configChange = changes.lscConfig as angular.IChangesObject<LexiconConfig>;
    if (configChange != null && configChange.currentValue != null) {
      this.configDirty = angular.copy(this.lscConfig);
      this.configPristine = angular.copy(this.lscConfig);
      this.unifiedViewModel = new ConfigurationFieldUnifiedViewModel(this.configDirty, this.lscUsers);
      this.unifiedViewModelPristine = angular.copy(this.unifiedViewModel);
      this.setupView();
    }

    const optionListsChange = changes.lscOptionLists as angular.IChangesObject<LexOptionList[]>;
    if (optionListsChange != null && optionListsChange.currentValue != null) {
      this.optionListsDirty = angular.copy(this.lscOptionLists);
      this.optionListsPristine = angular.copy(this.lscOptionLists);
    }
  }

  $onDestroy(): void {
    this.sendReceive.cancelAllStatusTimers();
  }

  configurationApply(): void {
    this.isSaving = true;

    // Publish updates in configDirty to send to server
    const isAnyTagUnspecified = this.inputSystemViewModelToConfig();

    if (isAnyTagUnspecified) {
      this.isSaving = false;
      return;
    }

    this.unifiedViewModel.toConfig(this.configDirty);

    this.lexProjectService.updateConfiguration(this.configDirty, this.optionListsDirty, result => {
      if (result.ok) {
        const isSuccess = result.data;
        if (isSuccess) {
          this.notice.push(this.notice.SUCCESS, 'Configuration updated successfully');
          this.configPristine = angular.copy(this.configDirty);
          this.optionListsPristine = angular.copy(this.optionListsDirty);
          this.sessionService.getSession().then(session => {
            session.projectSettings<LexiconProjectSettings>().config = angular.copy(this.configPristine);
            session.projectSettings<LexiconProjectSettings>().optionlists = angular.copy(this.optionListsPristine);
          });
        } else {
          this.warnOfUnsavedEdits();
          this.configDirty = angular.copy(this.lscConfig);
          this.optionListsDirty = angular.copy(this.lscOptionLists);
          this.setupView();
          this.sendReceive.startSyncStatusTimer();
        }

        this.$scope.configForm.$setPristine();
      }

      this.isSaving = false;
    });

    this.lscOnUpdate({ $event: { config: this.configDirty, optionLists: this.optionListsDirty } });
  }

  // noinspection JSUnusedGlobalSymbols
  addNewInputSystem(): void {
    this.activeTab = ConfigurationTab.InputSystems; // Switch to Input System tab
    this.addInputSystem = true; // Show New Input System window
  }

  // noinspection JSUnusedGlobalSymbols
  onUpdate = (
    $event: {
      pollUpdateTimerSecondsDirty?: number,
      configDirty?: LexiconConfig,
      inputSystemViewModels?: { [inputSystemId: string]: ConfigurationInputSystemsViewModel },
      inputSystemsList?: ConfigurationInputSystemsViewModel[],
      optionListsDirty?: LexOptionList[],
      unifiedViewModel?: ConfigurationFieldUnifiedViewModel,
      isInitialLoad?: boolean,
      addInputSystem?: boolean
    }
  ): void => {
    if ($event.pollUpdateTimerSecondsDirty > 0) {  // Will be false if number is undefined
      this.configDirty.pollUpdateIntervalMs = $event.pollUpdateTimerSecondsDirty * 1000;
    }
    if ($event.configDirty) {
      this.configDirty = $event.configDirty;
      this.$scope.configForm.$setDirty();

      // Force fire $onChanges: see https://github.com/angular/angular.js/issues/14572
      this.configDirty = angular.copy(this.configDirty);
      return;
    }

    if ($event.inputSystemViewModels) {
      this.inputSystemViewModels = $event.inputSystemViewModels;
      this.inputSystemViewModelToConfig();
    }

    if ($event.inputSystemsList) {
      this.inputSystemsList = $event.inputSystemsList;
    }

    if ($event.optionListsDirty) {
      this.optionListsDirty = $event.optionListsDirty;
    }

    if ($event.unifiedViewModel) {
      this.unifiedViewModel = $event.unifiedViewModel;
      if ($event.isInitialLoad) {
        this.unifiedViewModelPristine = angular.copy($event.unifiedViewModel);
      }
    }

    if (this.isPristine()) {
      this.$scope.configForm.$setPristine();
    } else {
      this.$scope.configForm.$setDirty();
    }

    if ($event.addInputSystem != null) {
      this.addInputSystem = $event.addInputSystem;
    }
  }

  private setupView(): void {
    if (this.configDirty.inputSystems == null) {
      return;
    }

    // InputSystemsViewModels
    this.inputSystemViewModels = {};
    this.inputSystemsList = [];
    for (const inputSystemTag in this.configDirty.inputSystems) {
      if (this.configDirty.inputSystems.hasOwnProperty(inputSystemTag)) {
        const inputSystem = this.configDirty.inputSystems[inputSystemTag];
        const viewModel = new ConfigurationInputSystemsViewModel(this.selects, inputSystem);
        this.inputSystemViewModels[viewModel.uuid] = viewModel;
        this.inputSystemsList.push(viewModel);
      }
    }

    // for FieldConfigCtrl
    this.fieldConfig = {};
    for (const fieldName of this.configDirty.entry.fieldOrder) {
      if (this.configDirty.entry.fields[fieldName] != null) {
        if (this.configDirty.entry.fields[fieldName].type !== 'fields') {
          this.fieldConfig[fieldName] = this.configDirty.entry.fields[fieldName];
        }
      }
    }

    const configSenses = this.configDirty.entry.fields.senses as LexConfigFieldList;
    for (const fieldName of configSenses.fieldOrder) {
      if (configSenses.fields[fieldName] != null) {
        if (configSenses.fields[fieldName].type !== 'fields') {
          this.fieldConfig[fieldName] = configSenses.fields[fieldName];
        }

      }
    }

    const configExamples = configSenses.fields.examples as LexConfigFieldList;
    for (const fieldName of configExamples.fieldOrder) {
      if (configExamples.fields[fieldName] != null) {
        if (configExamples.fields[fieldName].type !== 'fields') {
          this.fieldConfig[fieldName] = configExamples.fields[fieldName];
        }
      }
    }
  }

  private pollUpdateSuccess = (): void => {
    if (this.$scope.configForm.$dirty && this.sendReceive.isInProgress()) {
      this.warnOfUnsavedEdits();
      this.configDirty = angular.copy(this.configPristine);
      this.optionListsDirty = angular.copy(this.optionListsPristine);
      this.unifiedViewModel = new ConfigurationFieldUnifiedViewModel(this.configDirty, this.lscUsers);
      this.unifiedViewModelPristine = angular.copy(this.unifiedViewModel);
      this.setupView();
      this.$scope.configForm.$setPristine();
    }
  }

  private syncProjectStatusSuccess = (): void => {
    this.sessionService.getSession(true).then(session => {
      this.configDirty = angular.copy(session.projectSettings<LexiconProjectSettings>().config);
      this.optionListsDirty = angular.copy(session.projectSettings<LexiconProjectSettings>().optionlists);
      this.lscOnUpdate({ $event: { config: this.configDirty, optionLists: this.optionListsDirty } });
      this.configPristine = angular.copy(this.configDirty);
      this.optionListsPristine = angular.copy(this.optionListsDirty);
      this.unifiedViewModel = new ConfigurationFieldUnifiedViewModel(this.configDirty, this.lscUsers);
      this.unifiedViewModelPristine = angular.copy(this.unifiedViewModel);
      this.setupView();
      this.$scope.configForm.$setPristine();
      this.notice.removeById(this.warnOfUnsavedEditsId);
      this.warnOfUnsavedEditsId = undefined;
    });
  }

  private warnOfUnsavedEdits = (): void => {
    if (this.warnOfUnsavedEditsId == null) {
      this.warnOfUnsavedEditsId = this.notice.push(this.notice.WARN, 'A synchronize has been started by ' +
        'another user. Please make your configuration changes when the synchronize has finished.');
    }
  }

  private inputSystemViewModelToConfig(): boolean {
    let isAnyTagUnspecified = false;
    this.configDirty.inputSystems = {};
    for (const inputSystemTag in this.inputSystemViewModels) {
      if (this.inputSystemViewModels.hasOwnProperty(inputSystemTag)) {
        const viewModel = this.inputSystemViewModels[inputSystemTag];
        if (viewModel.inputSystem.tag.includes('-unspecified')) {
          isAnyTagUnspecified = true;
          this.notice.push(this.notice.ERROR, 'Specify at least one Script, Region or Variant for ' +
            viewModel.languageDisplayName());
        }

        this.configDirty.inputSystems[viewModel.inputSystem.tag] = viewModel.inputSystem;
      }
    }

    // Force fire $onChanges: see https://github.com/angular/angular.js/issues/14572
    this.configDirty = angular.copy(this.configDirty);

    return isAnyTagUnspecified;
  }

  private isPristine(): boolean {
    return angular.equals(this.unifiedViewModelPristine, this.unifiedViewModel)  &&
      angular.equals(this.configPristine, this.configDirty)  &&
      angular.equals(this.optionListsPristine, this.optionListsDirty);
  }

}

export const LexiconConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    lscConfig: '<',
    lscOptionLists: '<',
    lscUsers: '<',
    lscOnUpdate: '&'
  },
  controller: LexiconConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration.component.html'
};

export enum ConfigurationTab {
  Fields = 0,
  InputSystems,
  OptionLists
}
