import * as angular from 'angular';

import {ApplicationHeaderService} from '../../../bellows/core/application-header.service';
import {BytesFilterFunction} from '../../../bellows/core/filters';
import {ModalService} from '../../../bellows/core/modal/modal.service';
import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../bellows/core/session.service';
import {UploadFile, UploadResponse} from '../../../bellows/shared/model/upload.model';
import {LexiconProjectService} from '../core/lexicon-project.service';

class UploadOptions {
  mergeRule: string = 'createDuplicates';
  skipSameModTime: boolean = true;
  deleteMatchingEntry: boolean = false;
  importStarted: boolean = false;
  isLift: boolean = false;
  progress: number = 0;
  file: UploadFile;
}

export class LexiconImportController implements angular.IController {
  upload = new UploadOptions();

  static $inject = ['$filter', '$state',
    '$uibModal', 'Upload',
    'silNoticeService', 'sessionService',
    'lexProjectService',
    'applicationHeaderService'
  ];
  constructor(private $filter: angular.IFilterService, private $state: angular.ui.IStateService,
              private $modal: ModalService, private Upload: any,
              private notice: NoticeService, private sessionService: SessionService,
              private lexProjectService: LexiconProjectService,
              private applicationHeaderService: ApplicationHeaderService) { }

  $onInit() {
    this.lexProjectService.setBreadcrumbs('importExport',  'LIFT Import');
    this.lexProjectService.setupSettings();
    this.applicationHeaderService.setPageName('Import from LIFT');
  }

  onFileSelect($file: File) {
    this.upload.file = $file;
    this.upload.isLift = (LexiconImportController.fileExtension(this.upload.file.name) === 'lift');
  }

  importLift() {
    if (!this.upload.file || this.upload.file.$error) return;
    this.sessionService.getSession().then(session => {
      if (this.upload.file.size > session.fileSizeMax()) {
        this.notice.push(this.notice.ERROR, '<b>' + this.upload.file.name + '</b> (' +
          this.$filter<BytesFilterFunction>('bytes')(this.upload.file.size) +
          ') is too large. It must be smaller than ' +
          this.$filter<BytesFilterFunction>('bytes')(session.fileSizeMax()) + '.');
        this.upload.progress = 0;
        this.upload.file = null;
        return;
      }

      let uploadUrl = '/upload/lf-lexicon/import-lift';
      if (this.upload.isLift) {
        this.notice.setLoading('Importing LIFT file...');
      } else {
        this.notice.setLoading('Importing zipped file...');
        uploadUrl = '/upload/lf-lexicon/import-zip';
      }

      this.upload.importStarted = true;
      this.upload.progress = 0;
      this.Upload.upload({
        url: uploadUrl,
        data: {
          file: this.upload.file,
          mergeRule: this.upload.mergeRule,
          skipSameModTime: this.upload.skipSameModTime,
          deleteMatchingEntry: this.upload.deleteMatchingEntry
        }
      }).then((response: UploadResponse) => {
          this.notice.cancelLoading();
          const isUploadSuccess = response.data.result;
          if (isUploadSuccess) {
            this.upload.progress = 100.0;
            const modalInstance = this.$modal.open({
              templateUrl: '/angular-app/languageforge/lexicon/settings/import-results.modal.html',
              controller: ['$scope', '$uibModalInstance',
                ($scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
                  $scope.show = {};
                  $scope.show.importErrors = false;
                  $scope.result = {
                    stats: response.data.data.stats,
                    importErrors: response.data.data.importErrors
                  };
                  $scope.ok = () => {
                    $modalInstance.close();
                  };

                  $scope.hasImportErrors = () => {
                    return ($scope.result.importErrors !== '');
                  };

                  $scope.showImportErrorsButtonLabel = () => {
                    if ($scope.show.importErrors) {
                      return 'Hide non-critical import errors';
                    }

                    return 'Show non-critical import errors';
                  };
                }
              ]
            });

            // run uploadSuccess even if modal is cancelled (via Esc)
            modalInstance.result.then(this.uploadSuccess, this.uploadSuccess);
          } else {
            this.upload.progress = 0;
            this.notice.push(this.notice.ERROR, response.data.data.errorMessage);
          }

          this.upload.file = null;
          this.upload.importStarted = false;
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
          this.notice.setPercentComplete(100.0 * evt.loaded / evt.total);
        });
    });
  }

  private uploadSuccess = () => {
    // FixMe: determine if the below comment should be implemented (it once was) - IJH 2018-03
    // reload the config after the import is complete
    this.sessionService.getSession(true).then(() => {
      this.notice.push(this.notice.SUCCESS,
        'Import completed successfully');
      this.notice.push(this.notice.INFO, 'Your project was successfully' +
        ' imported.  Carefully review the configuration below before continuing,' +
        ' especially the input systems and fields tabs');
      this.$state.go('configuration');
    });
  }

  // see http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
  private static fileExtension(filename: string) {
    const a = filename.split('.');
    if (a.length === 1 || (a[0] === '' && a.length === 2)) {
      return '';
    }

    return a.pop().toLowerCase();
  }

}

export const LexiconImportComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: LexiconImportController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/import.component.html'
};
