import * as angular from 'angular';

import {SessionService} from '../../../../bellows/core/session.service';
import {LexiconProjectService} from '../../core/lexicon-project.service';
import {UploadFile, UploadResponse} from '../../shared/model/upload.model';

class Picture {
  fileName: string;
  caption: string;
}

export const FieldPictureModule = angular
  .module('palaso.ui.dc.picture', ['ngFileUpload'])

  // Palaso UI Dictionary Control: Picture
  .directive('dcPicture', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-picture.component.html',
    scope: {
      config: '=',
      model: '=',
      pictures: '=',
      control: '=',
      fieldName: '='
    },
    controller: ['$scope', '$state', 'Upload', '$filter', 'sessionService', 'lexProjectService',
      'lexConfigService', 'silNoticeService', 'modalService',
      ($scope, $state, Upload, $filter, sessionService: SessionService, lexProjectService: LexiconProjectService,
       lexConfigService, notice, modalService) => {

        $scope.$state = $state;
        $scope.upload = {};
        $scope.upload.progress = 0;
        $scope.upload.file = null;
        $scope.contextGuid = $scope.$parent.contextGuid;

        $scope.fieldContainsData = lexConfigService.fieldContainsData;

        $scope.getPictureUrl = function getPictureUrl(picture: Picture): string {
          if (isExternalReference(picture.fileName)) {
            return '/Site/views/shared/image/placeholder.png';
          }
          return '/assets/lexicon/' + $scope.control.project.slug + '/pictures/' + picture.fileName;
        };

        $scope.getPictureDescription = function getPictureDescription(picture: Picture): string {
          if (!isExternalReference(picture.fileName)) return picture.fileName;

          return 'This picture references an external file (' +
            picture.fileName +
            ') and therefore cannot be synchronized. ' +
            'To see the picture, link it to an internally referenced file. ' +
            'Replace the file here or in FLEx, move or copy the file to the Linked Files folder.';
        };

        function isExternalReference(fileName: string): boolean {
          const isWindowsLink = (fileName.indexOf(':\\') >= 0);
          const isLinuxLink = (fileName.indexOf('//') >= 0);
          return isWindowsLink || isLinuxLink;
        }

        // strips the timestamp file prefix (returns everything after the '_')
        function originalFileName(fileName: string): string {
          return fileName.substr(fileName.indexOf('_') + 1);
        }

        function addPicture(fileName: string): void {
          const newPicture: Picture = new Picture();
          const captionConfig = angular.copy($scope.config);
          captionConfig.type = 'multitext';
          newPicture.fileName = fileName;
          newPicture.caption = $scope.control.makeValidModelRecursive(captionConfig, {});
          $scope.pictures.push(newPicture);
        }

        $scope.deletePicture = function deletePicture(index: number): void {
          const fileName = $scope.pictures[index].fileName;
          if (fileName) {
            const deleteMsg = 'Are you sure you want to delete the picture <b>\'' +
              originalFileName(fileName) + '\'</b>';
            modalService.showModalSimple('Delete Picture', deleteMsg, 'Cancel', 'Delete Picture').then(() => {
              $scope.pictures.splice(index, 1);
              lexProjectService.removeMediaFile('sense-image', fileName, result => {
                if (result.ok) {
                  if (!result.data.result) {
                    notice.push(notice.ERROR, result.data.errorMessage);
                  }
                }
              });
            }, angular.noop);
          } else {
            $scope.pictures.splice(index, 1);
          }
        };

        $scope.uploadFile = function uploadFile(file: UploadFile): void {
          if (!file || file.$error) {
            return;
          }

          sessionService.getSession().then(session => {
            if (file.size > session.fileSizeMax()) {
              $scope.upload.progress = 0;
              $scope.upload.file = null;
              notice.push(notice.ERROR, '<b>' + file.name + '</b> (' +
                $filter('bytes')(file.size) + ') is too large. It must be smaller than ' +
                $filter('bytes')(session.fileSizeMax()) + '.');
              return;
            }

            $scope.upload.file = file;
            $scope.upload.progress = 0;
            Upload.upload({
              url: '/upload/lf-lexicon/sense-image',
              data: {file}
            }).then((response: UploadResponse) => {
                const isUploadSuccess = response.data.result;
                if (isUploadSuccess) {
                  $scope.upload.progress = 100.0;
                  addPicture(response.data.data.fileName);
                  $scope.upload.showAddPicture = false;
                } else {
                  $scope.upload.progress = 0;
                  notice.push(notice.ERROR, response.data.data.errorMessage);
                }

                $scope.upload.file = null;
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

                $scope.upload.file = null;
                notice.push(notice.ERROR, errorMessage);
              },

              (evt: ProgressEvent) => {
                $scope.upload.progress = Math.floor(100.0 * evt.loaded / evt.total);
              });
          });
        };

      }]
  })])
  .name;
