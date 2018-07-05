import * as angular from 'angular';

import {BytesFilterFunction} from '../../../../bellows/core/filters';
import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {NoticeService} from '../../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../../bellows/core/session.service';
import {UploadFile, UploadResponse} from '../../../../bellows/shared/model/upload.model';
import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexiconProjectService} from '../../core/lexicon-project.service';
import {LexiconUtilityService} from '../../core/lexicon-utility.service';
import {LexPicture} from '../../shared/model/lex-picture.model';
import {LexConfigInputSystems, LexConfigPictures} from '../../shared/model/lexicon-config.model';
import {FieldControl} from './field-control.model';

class FileUpload {
  file: File = null;
  progress: number = 0;
  showAddPicture: boolean = false;
}

export class FieldPictureController implements angular.IController {
  pictures: LexPicture[];
  config: LexConfigPictures;
  control: FieldControl;
  fieldName: string;
  parentContextGuid: string;

  upload: FileUpload = new FileUpload();
  contextGuid: string;
  inputSystems: LexConfigInputSystems;

  fieldContainsData = LexiconConfigService.fieldContainsData;

  static $inject = ['$filter', '$state',
    'Upload', 'modalService',
    'silNoticeService', 'sessionService',
    'lexProjectService'
  ];
  constructor(private $filter: angular.IFilterService, private $state: angular.ui.IStateService,
              private Upload: any, private modalService: ModalService,
              private notice: NoticeService, private sessionService: SessionService,
              private lexProjectService: LexiconProjectService) { }

  $onInit(): void {
    this.inputSystems = this.control.config.inputSystems;
    this.contextGuid = this.parentContextGuid;
  }

  isAtEditorEntry(): boolean {
    return LexiconUtilityService.isAtEditorEntry(this.$state);
  }

  getPictureUrl(picture: LexPicture): string {
    if (FieldPictureController.isExternalReference(picture.fileName)) {
      return '/Site/views/shared/image/placeholder.png';
    }
    return '/assets/lexicon/' + this.control.project.slug + '/pictures/' + picture.fileName;
  }

  // noinspection JSMethodCanBeStatic
  getPictureDescription(picture: LexPicture): string {
    if (!FieldPictureController.isExternalReference(picture.fileName)) return picture.fileName;

    return 'This picture references an external file (' +
      picture.fileName +
      ') and therefore cannot be synchronized. ' +
      'To see the picture, link it to an internally referenced file. ' +
      'Replace the file here or in FieldWorks, move or copy the file to the Linked Files folder.';
  }

  deletePicture(index: number): void {
    const fileName: string = this.pictures[index].fileName;
    if (fileName) {
      const deleteMsg: string = 'Are you sure you want to delete the picture <b>\'' +
        FieldPictureController.originalFileName(fileName) + '\'</b>';
      this.modalService.showModalSimple('Delete Picture', deleteMsg, 'Cancel', 'Delete Picture').then(() => {
        this.pictures.splice(index, 1);
        this.lexProjectService.removeMediaFile('sense-image', fileName, result => {
          if (result.ok) {
            if (!result.data.result) {
              this.notice.push(this.notice.ERROR, result.data.errorMessage);
            }
          }
        });
      }, () => { });
    } else {
      this.pictures.splice(index, 1);
    }
  }

  uploadFile(file: UploadFile): void {
    if (!file || file.$error) {
      return;
    }

    this.sessionService.getSession().then(session => {
      if (file.size > session.fileSizeMax()) {
        this.upload.progress = 0;
        this.upload.file = null;
        this.notice.push(this.notice.ERROR, '<b>' + file.name + '</b> (' +
          this.$filter<BytesFilterFunction>('bytes')(file.size) + ') is too large. It must be smaller than ' +
          this.$filter<BytesFilterFunction>('bytes')(session.fileSizeMax()) + '.');
        return;
      }

      this.upload.file = file;
      this.upload.progress = 0;
      this.Upload.upload({
        url: '/upload/lf-lexicon/sense-image',
        data: {file}
      }).then((response: UploadResponse) => {
          const isUploadSuccess = response.data.result;
          if (isUploadSuccess) {
            this.upload.progress = 100.0;
            this.addPicture(response.data.data.fileName);
            this.upload.showAddPicture = false;
          } else {
            this.upload.progress = 0;
            this.notice.push(this.notice.ERROR, response.data.data.errorMessage);
          }

          this.upload.file = null;
        },

        (response: UploadResponse) => {
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

          this.upload.file = null;
          this.notice.push(this.notice.ERROR, errorMessage);
        },

        (evt: ProgressEvent) => {
          this.upload.progress = Math.floor(100.0 * evt.loaded / evt.total);
        });
    });
  }

  private addPicture(fileName: string): void {
    const newPicture: LexPicture = new LexPicture();
    const captionConfig = angular.copy(this.config);
    captionConfig.type = 'multitext';
    newPicture.fileName = fileName;
    newPicture.caption = this.control.makeValidModelRecursive(captionConfig, {});
    this.pictures.push(newPicture);
  }

  private static isExternalReference(fileName: string): boolean {
    const isWindowsLink = (fileName.indexOf(':\\') >= 0);
    const isLinuxLink = (fileName.indexOf('//') >= 0);
    return isWindowsLink || isLinuxLink;
  }

  // strips the timestamp file prefix (returns everything after the '_')
  private static originalFileName(fileName: string): string {
    return fileName.substr(fileName.indexOf('_') + 1);
  }

}

export const FieldPictureComponent: angular.IComponentOptions = {
  bindings: {
    pictures: '=',
    config: '<',
    control: '<',
    fieldName: '<',
    parentContextGuid: '<'
  },
  controller: FieldPictureController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-picture.component.html'
};
