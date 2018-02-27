import * as angular from 'angular';

import {NoticeService} from '../../../../bellows/core/notice/notice.service';
import {Session, SessionService} from '../../../../bellows/core/session.service';
import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexiconProjectService} from '../../core/lexicon-project.service';
import {LexiconSendReceiveService} from '../../core/lexicon-send-receive.service';
import {
  LexConfigField, LexConfigFieldList, LexConfigMultiText,
  LexiconConfig
} from '../../shared/model/lexicon-config.model';
import { LexiconProjectSettings } from '../../shared/model/lexicon-project-settings.model';
import {LexOptionList} from '../../shared/model/option-list.model';
import {Field} from './configuration-fields.component';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';
import {OptionSelects} from './option-selects.model';

interface LexiconConfigControllerScope extends angular.IScope {
  configForm: angular.IFormController;
}

export class LexiconConfigurationController implements angular.IController {
  currentField: Field = {
    name: '',
    inputSystems: {
      fieldOrder: [],
      selecteds: {}
    }
  };
  isSaving = false;
  readonly selects = new OptionSelects();

  configDirty: LexiconConfig;
  configPristine: LexiconConfig;
  fieldConfig: { [fieldName: string]: LexConfigField };
  inputSystemViewModels: { [inputSystemId: string]: ConfigurationInputSystemsViewModel };
  inputSystemsList: ConfigurationInputSystemsViewModel[];
  optionListsDirty: any;
  optionListsPristine: any;

  private session: Session;
  private warnOfUnsavedEditsId: string;

  static $inject: string[] = ['$scope', 'silNoticeService',
    'sessionService', 'lexProjectService',
    'lexConfigService', 'lexSendReceive'];
  constructor(private $scope: LexiconConfigControllerScope, private notice: NoticeService,
              private sessionService: SessionService, private lexProjectService: LexiconProjectService,
              private lexConfig: LexiconConfigService, private sendReceive: LexiconSendReceiveService) {
    lexProjectService.setBreadcrumbs('configuration', 'Configuration');

    sessionService.getSession().then(session => {
      this.session = session;
      this.configDirty = angular.copy(session.projectSettings<LexiconProjectSettings>().config);
      this.configPristine = angular.copy(session.projectSettings<LexiconProjectSettings>().config);
      this.optionListsDirty = angular.copy(session.projectSettings<LexiconProjectSettings>().optionlists);
      this.optionListsPristine = angular.copy(session.projectSettings<LexiconProjectSettings>().optionlists);
      this.isSaving = false;

      this.setupView();
      this.selectField('lexeme');

      sendReceive.setPollUpdateSuccessCallback(this.pollUpdateSuccess);
      sendReceive.setSyncProjectStatusSuccessCallback(this.syncProjectStatusSuccess);
    });
  }

  $onDestroy() {
    this.sendReceive.cancelAllStatusTimers();
  }

  configurationApply() {
    let isAnyTagUnspecified = false;
    this.isSaving = true;

    // Publish updates in configDirty to send to server
    this.configDirty.inputSystems = {};
    angular.forEach(this.inputSystemViewModels, viewModel => {
      if (viewModel.inputSystem.tag.indexOf('-unspecified') > -1) {
        isAnyTagUnspecified = true;
        this.notice.push(this.notice.ERROR, 'Specify at least one Script, Region or Variant for ' +
          viewModel.languageDisplayName());
      }

      this.configDirty.inputSystems[viewModel.inputSystem.tag] = viewModel.inputSystem;
    });

    if (isAnyTagUnspecified) {
      this.isSaving = false;
      return;
    }

    this.lexProjectService.updateConfiguration(this.configDirty, this.optionListsDirty, result => {
      if (result.ok) {
        const isSuccess = result.data;
        if (isSuccess) {
          this.notice.push(this.notice.SUCCESS, 'Configuration updated successfully');
          this.session.projectSettings<LexiconProjectSettings>().config = angular.copy(this.configDirty);
          this.configPristine = angular.copy(this.configDirty);
          this.session.projectSettings<LexiconProjectSettings>().optionlists = angular.copy(this.optionListsDirty);
          this.optionListsPristine = angular.copy(this.optionListsDirty);
          this.lexConfig.refresh();
        } else {
          this.warnOfUnsavedEdits();
          this.configDirty = angular.copy(this.session.projectSettings<LexiconProjectSettings>().config);
          this.optionListsDirty = angular.copy(this.session.projectSettings<LexiconProjectSettings>().optionlists);
          this.setupView();
          this.selectField(this.currentField.name, true);
          this.sendReceive.startSyncStatusTimer();
        }

        this.$scope.configForm.$setPristine();
      }

      this.isSaving = false;
    });

  }

  selectField = (fieldName: string, isReload: boolean = false) => {
    if (this.currentField.name !== fieldName || isReload) {
      const inputSystems = angular.copy((this.fieldConfig[fieldName] as LexConfigMultiText).inputSystems);
      this.currentField.name = fieldName;
      this.currentField.inputSystems.fieldOrder = [];
      this.currentField.inputSystems.selecteds = {};
      angular.forEach(inputSystems, tag => {
        this.currentField.inputSystems.selecteds[tag] = true;
      });

      // if the field uses input systems, add the selected systems first then the unselected systems
      if (inputSystems) {
        this.currentField.inputSystems.fieldOrder = inputSystems;
        angular.forEach(this.configDirty.inputSystems, (inputSystem, tag) => {
          if (!(tag in this.currentField.inputSystems.selecteds) &&
            this.currentField.inputSystems.fieldOrder.indexOf(tag) === -1
          ) {
            this.currentField.inputSystems.fieldOrder.push(tag);
          }
        });
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  onUpdate = (
    $event: {
      configDirty?: LexiconConfig,
      inputSystemViewModels?: { [inputSystemId: string]: ConfigurationInputSystemsViewModel },
      inputSystemsList?: ConfigurationInputSystemsViewModel[],
      optionListsDirty?: LexOptionList[]
    }
  ): void => {
    if ($event.configDirty) {
      this.configDirty = $event.configDirty;
      this.$scope.configForm.$setDirty();
    }

    if ($event.inputSystemViewModels) {
      this.inputSystemViewModels = $event.inputSystemViewModels;
      this.$scope.configForm.$setDirty();
    }

    if ($event.inputSystemsList) {
      this.inputSystemsList = $event.inputSystemsList;
      this.$scope.configForm.$setDirty();
    }

    if ($event.optionListsDirty) {
        this.optionListsDirty = $event.optionListsDirty;
        this.$scope.configForm.$setDirty();
    }
  }

  private setupView(): void {
    if (!angular.isDefined(this.configDirty.inputSystems)) {
      return;
    }

    // InputSystemsViewModels
    this.inputSystemViewModels = {};
    this.inputSystemsList = [];
    angular.forEach(this.configDirty.inputSystems, inputSystem => {
      const viewModel = new ConfigurationInputSystemsViewModel(this.selects, inputSystem);
      this.inputSystemViewModels[viewModel.uuid] = viewModel;
      this.inputSystemsList.push(viewModel);
    });

    // for FieldConfigCtrl
    this.fieldConfig = {};
    angular.forEach(this.configDirty.entry.fieldOrder, fieldName => {
      if (angular.isDefined(this.configDirty.entry.fields[fieldName])) {
        if (this.configDirty.entry.fields[fieldName].type !== 'fields') {
          this.fieldConfig[fieldName] = this.configDirty.entry.fields[fieldName];
        }
      }
    });

    angular.forEach((this.configDirty.entry.fields.senses as LexConfigFieldList).fieldOrder, fieldName => {
      if (angular.isDefined((this.configDirty.entry.fields.senses as LexConfigFieldList).fields[fieldName])) {
        if ((this.configDirty.entry.fields.senses as LexConfigFieldList).fields[fieldName].type !== 'fields') {
          this.fieldConfig[fieldName] = (this.configDirty.entry.fields.senses as LexConfigFieldList).fields[fieldName];
        }

      }
    });

    angular.forEach(((this.configDirty.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList)
        .fieldOrder, fieldName => {
        if (angular.isDefined(((this.configDirty.entry.fields.senses as LexConfigFieldList).fields
            .examples as LexConfigFieldList).fields[fieldName])
        ) {
          if (((this.configDirty.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList)
              .fields[fieldName].type !== 'fields'
          ) {
            this.fieldConfig[fieldName] = ((this.configDirty.entry.fields.senses as LexConfigFieldList).fields
              .examples as LexConfigFieldList).fields[fieldName];
          }
        }
      }
    );
  }

  private pollUpdateSuccess = () => {
    if (this.$scope.configForm.$dirty) {
      if (this.sendReceive.isInProgress()) {
        this.warnOfUnsavedEdits();
        this.configDirty = angular.copy(this.configPristine);
        this.optionListsDirty = angular.copy(this.optionListsPristine);
        this.setupView();
        this.selectField(this.currentField.name, true);
        this.$scope.configForm.$setPristine();
      }
    }
  }

  private syncProjectStatusSuccess = () => {
    this.sessionService.getSession(true).then(session => {
      this.session = session;
      this.configDirty = angular.copy(session.projectSettings<LexiconProjectSettings>().config);
      this.optionListsDirty = angular.copy(session.projectSettings<LexiconProjectSettings>().optionlists);
      this.setupView();
      this.selectField(this.currentField.name, true);
      this.$scope.configForm.$setPristine();
      this.notice.removeById(this.warnOfUnsavedEditsId);
      this.warnOfUnsavedEditsId = undefined;
    });
  }

  private warnOfUnsavedEdits = () => {
    if (angular.isUndefined(this.warnOfUnsavedEditsId)) {
      this.warnOfUnsavedEditsId = this.notice.push(this.notice.WARN, 'A synchronize has been started by ' +
        'another user. Please make your configuration changes when the synchronize has finished.');
    }
  }

}

export const LexiconConfigurationComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: LexiconConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration.component.html'
};
