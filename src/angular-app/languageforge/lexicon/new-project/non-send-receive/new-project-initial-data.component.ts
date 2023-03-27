import * as angular from 'angular';

import {BytesFilterFunction} from '../../../../bellows/core/filters';
import {NoticeService} from '../../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../../bellows/core/session.service';
import {UploadFile, UploadResponse} from '../../../../bellows/shared/model/upload.model';
import {LexiconNewProjectState} from '../lexicon-new-project-state.model';
import {LexiconNewProjectController, NewProject} from '../lexicon-new-project.component';
import {NewProjectSelectPrimaryLanguageState} from './new-project-select-primary-language.component';
import {NewProjectVerifyDataState} from './new-project-verify-data.component';

export class NewProjectInitialDataController implements angular.IController {
  npiNewProject: NewProject;
  npiGotoNextState: () => void;

  showFlexHelp: boolean = false;

  static $inject = ['$filter', 'Upload',
    'sessionService', 'silNoticeService'];
  constructor(private readonly $filter: angular.IFilterService, private readonly Upload: any,
              private readonly sessionService: SessionService, private readonly notice: NoticeService) { }

  uploadFile(file: UploadFile): void {
    if (!file || file.$error) {
      return;
    }

    this.sessionService.getSession().then(session => {
      if (file.size > session.fileSizeMax()) {
        this.notice.push(this.notice.ERROR, '<b>' + file.name + '</b> (' +
          this.$filter<BytesFilterFunction>('bytes')(file.size) + ') is too large. It must be smaller than ' +
          this.$filter<BytesFilterFunction>('bytes')(session.fileSizeMax()) + '.');
        return;
      }

      this.notice.setLoading('Importing ' + file.name + '...');
      this.Upload.upload({
        url: '/upload/import-zip',
        data: { file }
      }).then((response: UploadResponse) => {
          this.notice.cancelLoading();
          const isUploadSuccess = response.data.result;
          if (isUploadSuccess) {
            this.notice.push(this.notice.SUCCESS, 'Successfully imported ' +
              file.name);
            this.npiNewProject.entriesImported = response.data.data.stats.importEntries;
            this.npiNewProject.importErrors = response.data.data.importErrors;
            this.npiGotoNextState();
          } else {
            this.npiNewProject.entriesImported = 0;
            this.notice.push(this.notice.ERROR, response.data.data.errorMessage);
          }
        },

        (response: UploadResponse) => {
          this.notice.cancelLoading();
          let errorMessage = 'Import failed.';
          if (response.status > 0) {
            errorMessage += ' Status: ' + response.status;
            if (response.statusText) {
              errorMessage += ' ' + response.statusText;
            }

            if (response.data) {
              errorMessage += '- ' + response.data;
            }
          }

          this.notice.push(this.notice.ERROR, errorMessage);
        },

        (evt: ProgressEvent) => {
          this.notice.setPercentComplete(Math.floor(100.0 * evt.loaded / evt.total));
        });
    });
  }

}

export const NewProjectInitialDataComponent: angular.IComponentOptions = {
  bindings: {
    npiNewProject: '=',
    npiGotoNextState: '&'
  },
  controller: NewProjectInitialDataController,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/non-send-receive/new-project-initial-data.component.html'
};

export const NewProjectInitialDataState = {
  url: '/non-send-receive-initial-data',
  name: 'newProject.initialData',
  template: `
    <new-project-initial-data
      npi-new-project="$ctrl.newProject"
      npi-goto-next-state="$ctrl.gotoNextState()">
    </new-project-initial-data>
  `,
  data: {
    step: 2,
    isSRProject: false,
    show: {
      backButton: false,
      nextButton: true,
      step3: true
    },
    nextButtonLabel: 'Skip',
    progressIndicatorStep1Label: 'Name',
    progressIndicatorStep2Label: 'Initial Data',
    progressIndicatorStep3Label: 'Verify',
    isFormValid(controller: LexiconNewProjectController): angular.IPromise<boolean> {
      return controller.neutral();
    },
    goNextState(controller: LexiconNewProjectController): void {
      if (controller.newProject.emptyProjectDesired) {
        controller.$state.go(NewProjectSelectPrimaryLanguageState.name);
        controller.neutral();
      } else {
        controller.$state.go(NewProjectVerifyDataState.name);
        controller.ok();
      }
    },
    goPreviousState(): void {
    }
  }
} as LexiconNewProjectState;
