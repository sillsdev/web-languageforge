
import * as angular from 'angular';
import { format, addMinutes } from 'date-fns';

import {BytesFilterFunction} from '../../../../bellows/core/filters';
import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {NoticeService} from '../../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../../bellows/core/session.service';
import {InterfaceConfig} from '../../../../bellows/shared/model/interface-config.model';
import {UploadFile, UploadResponse} from '../../../../bellows/shared/model/upload.model';
import {LexiconProjectService} from '../../core/lexicon-project.service';
import {Rights} from '../../core/lexicon-rights.service';
import {LexiconUtilityService} from '../../core/lexicon-utility.service';
import { RecordingStateService } from '../recording-state.service';

export class FieldAudioController implements angular.IController {
  dcFilename: string;
  dcRights: Rights;
  dcInterfaceConfig: InterfaceConfig;
  dcProjectSlug: string;

  showAudioUpload: boolean = false;
  showAudioRecorder: boolean = false;

  private uploading$: angular.IDeferred<void>;

  static $inject = ['$filter', '$state',
    'Upload', 'modalService',
    'silNoticeService', 'sessionService',
    'lexProjectService', '$scope', '$q', 'recordingStateService'
  ];
  constructor(
    private $filter: angular.IFilterService,
    private $state: angular.ui.IStateService,
    private Upload: angular.angularFileUpload.IUploadService,
    private modalService: ModalService,
    private notice: NoticeService,
    private sessionService: SessionService,
    private lexProjectService: LexiconProjectService,
    private $scope: angular.IScope,
    private $q: angular.IQService,
    private recordingStateService: RecordingStateService,
  ) {
    this.$scope.$watch(() => this.dcFilename, () => this.showAudioRecorder = false);
  }

  hasAudio(): boolean {
    if (this.dcFilename == null) {
      return false;
    }

    return this.dcFilename.trim() !== '';
  }

  isAtEditorEntry(): boolean {
    return LexiconUtilityService.isAtEditorEntry(this.$state);
  }

  audioPlayUrl(): string {
    let url = '';
    if (this.hasAudio()) {
      url = '/assets/lexicon/' + this.dcProjectSlug + '/audio/' + this.dcFilename;
    }

    return url;
  }

  audioDownloadUrl(): string {
    let url = '';
    if (this.hasAudio()) {
      url = '/download' + this.audioPlayUrl();
    }

    return url;
  }

  displayFilename(): string {
    return FieldAudioController.originalFileName(this.dcFilename);
  }

  deleteAudio(): void {
    if (this.hasAudio()) {
      const deleteMsg = 'Are you sure you want to delete the audio <b>\'' +
        FieldAudioController.originalFileName(this.dcFilename) + '\'</b>?';
      this.modalService.showModalSimple('Delete Audio', deleteMsg, 'Cancel', 'Delete Audio')
        .then(() => {
          this.lexProjectService.removeMediaFile('audio', this.dcFilename, result => {
            if (result.ok) {
              if (result.data.result) {
                this.dcFilename = '';
              } else {
                this.notice.push(this.notice.ERROR, result.data.errorMessage);
              }
            }
          });
        }, () => { });
    }
  }

  uploadAudio(file: UploadFile, recordedInBrowser: boolean = false): void {
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

      this.notice.setLoading('Uploading ' + file.name + '...');
      this.uploading$ = this.$q.defer<void>();
      this.recordingStateService.startUploading(this.uploading$.promise);
      return this.Upload.upload<any>({
        method: 'POST',
        url: '/upload/audio',
        data: {
          file,
          previousFilename: this.dcFilename,
          recordedInBrowser: recordedInBrowser
        }
      }).then((response) => {
          this.notice.cancelLoading();
          const isUploadSuccess = response.data.result;
          if (isUploadSuccess) {
            this.dcFilename = response.data.data.fileName;
            this.showAudioUpload = false;
            this.notice.push(this.notice.SUCCESS, 'File uploaded successfully.');
            if (response.data.data.fileSize > 10000000) {
              // `MaximumFileSize` in https://github.com/sillsdev/chorus/blob/master/src/LibChorus/FileTypeHandlers/audio/AudioFileTypeHandler.cs
              this.notice.push(this.notice.WARN, 'WARNING: Because the audio file - ' + response.data.data.fileName + ' - is larger than 10 MB, it will not be synced with FLEx.');
            }
          } else {
            this.notice.push(this.notice.ERROR, response.data.data.errorMessage);
          }
        },

        (response: UploadResponse) => {
          this.notice.cancelLoading();
          let errorMessage = 'Upload failed.';
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
        }).finally(() => this.uploading$.resolve());
    });
  }

  audioRecorderCallback = (blob: Blob) => {
    if (blob) {
      const date = new Date();
      const fileName = 'recording_' + format(addMinutes(date, date.getTimezoneOffset()), 'yyyy_MM_dd_HH_mm_ss') + '.webm';
      const file = new File([blob], fileName);
      this.uploadAudio(file, true);
    }
    this.showAudioRecorder = false;
  }

  // strips the timestamp file prefix (returns everything after the '_')
  private static originalFileName(filename: string) {
    if (filename == null) {
      return '';
    }

    if (!filename.trim()) {
      return filename;
    }

    return filename.substr(filename.indexOf('_') + 1);
  }

  $onDestroy() {
    this.uploading$?.resolve();
  }
}

export const FieldAudioComponent: angular.IComponentOptions = {
  bindings: {
    dcFilename: '=',
    dcRights: '<',
    dcInterfaceConfig: '<',
    dcProjectSlug: '<'
  },
  controller: FieldAudioController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-audio.component.html'
};
