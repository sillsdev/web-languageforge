import * as angular from 'angular';

import {JsonRpcResult} from '../../../bellows/core/api/json-rpc.service';
import {BreadcrumbModule} from '../../../bellows/core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {Session, SessionService} from '../../../bellows/core/session.service';
import { SiteWideNoticeModule, SiteWideNoticeService } from '../../../bellows/core/site-wide-notice-service';
import {ListViewModule} from '../../../bellows/shared/list-view.component';
import {UploadFile} from '../../../bellows/shared/model/upload.model';
import {TypeAheadModule} from '../../../bellows/shared/type-ahead.module';
import {SfChecksCoreModule} from '../core/sf-checks-core.module';
import {Text} from '../shared/model/text.model';
import {TextDropModule} from '../shared/textdrop.directive';

export const SfChecksProjectModule = angular
  .module('sfchecks.project', [
    'ngFileUpload',
    BreadcrumbModule,
    CoreModule,
    SfChecksCoreModule,
    ListViewModule,
    TypeAheadModule,
    NoticeModule,
    TextDropModule,
    SiteWideNoticeModule
  ])
  .controller('ProjectCtrl', ['$scope', 'textService', 'sessionService', 'breadcrumbService',
    'linkService', 'listviewSortingService', 'silNoticeService', 'sfchecksProjectService',
    'messageService', 'utilService', 'modalService', '$q', 'siteWideNoticeService',
  ($scope, textService, sessionService: SessionService, breadcrumbService,
   linkService, sorting, notice, sfchecksProjectService,
   messageService, util, modalService, $q, siteWideNoticeService: SiteWideNoticeService) => {

    $scope.finishedLoading = false;

    // Rights
    $scope.rights = {};
    $scope.rights.archive = false;
    $scope.rights.create = false;
    // $scope.rights.edit = sessionService.hasSiteRight(sessionService.domain.PROJECTS, sessionService.operation.EDIT);
    $scope.rights.edit = false;
    $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create || $scope.rights.edit;

    // Broadcast Messages
    // items are in the format of {id: id, subject: subject, content: content}
    $scope.messages = [];

    $scope.markMessageRead = function markMessageRead(id: string): void {
      for (let i = 0; i < $scope.messages.length; ++i) {
        const message = $scope.messages[i];
        if (message.id === id) {
          $scope.messages.splice(i, 1);
          messageService.markRead(id);
          break;
        }
      }
    };

    // Listview Selection
    $scope.newTextCollapsed = true;
    $scope.selected = [];
    $scope.updateSelection = function updateSelection(event: Event, text: Text): void {
      const selectedIndex = $scope.selected.indexOf(text);
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.checked && selectedIndex === -1) {
        $scope.selected.push(text);
      } else if (!checkbox.checked && selectedIndex !== -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function isSelected(text: Text): boolean {
      return text !== null && $scope.selected.includes(text);
    };

    $scope.texts = [];

    // Listview Sorting

    $scope.sortdata = { sortColumn: '', direction: '' };

    $scope.sortIconClass = function sortIconClass(columnName: string): string {
      return sorting.sortIconClass($scope.sortdata, columnName);
    };

    $scope.setSortColumn = function setSortColumn(columnName: string): void {
      return sorting.setSortColumn($scope.sortdata, columnName);
    };

    $scope.doSort = function doSort(): void {
      sorting.sortDataByColumn($scope.texts, $scope.sortdata.sortColumn, $scope.sortdata.direction);
    };

    $scope.doSortByColumn = function doSortByColumn(columnName: string): void {
      $scope.setSortColumn(columnName);
      $scope.doSort();
    };

    $scope.getPageDto = function getPageDto(): void {
      $q.all([sessionService.getSession(), sfchecksProjectService.pageDto()]).then((data: any[]) => {
        const session = data[0] as Session;
        const result = data[1] as JsonRpcResult;
        $scope.texts = result.data.texts;
        $scope.textsCount = $scope.texts.length;
        $scope.enhanceDto($scope.texts);

        $scope.messages = result.data.broadcastMessages;

        // update activity count service
        $scope.activityUnreadCount = result.data.activityUnreadCount;

        $scope.members = result.data.members;

        $scope.project = result.data.project;
        $scope.project.url = linkService.project();

        // Breadcrumb
        breadcrumbService.set('top', [
          { href: '/app/projects', label: 'My Projects' },
          { href: linkService.project(), label: $scope.project.name }
        ]);

        const rights = result.data.rights;
        $scope.rights.archive =
          session.hasRight(rights, sessionService.domain.TEXTS, sessionService.operation.ARCHIVE) &&
          !session.project().isArchived;
        $scope.rights.create = session.hasRight(rights, sessionService.domain.TEXTS, sessionService.operation.CREATE) &&
          !session.project().isArchived;
        $scope.rights.edit = session.hasRight(rights, sessionService.domain.TEXTS, sessionService.operation.EDIT) &&
          !session.project().isArchived;
        $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create ||
          $scope.rights.edit;

        $scope.finishedLoading = true;
      });
    };

    // Archive Texts
    $scope.archiveTexts = function archiveTexts(): void {
      const textIds: string[] = [];
      let message = '';
      for (const text of $scope.selected) {
        textIds.push(text.id);
      }

      if (textIds.length === 1) {
        message = 'Are you sure you want to archive the selected text?';
      } else {
        message = 'Are you sure you want to archive the ' + textIds.length + ' selected texts?';
      }

      const modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Archive',
        headerText: 'Archive Texts?',
        bodyText: message
      };
      modalService.showModal({}, modalOptions).then(() => {
        textService.archive(textIds).then((result: JsonRpcResult) => {
          if (result.ok) {
            $scope.selected = []; // Reset the selection
            $scope.getPageDto();
            if (textIds.length === 1) {
              notice.push(notice.SUCCESS, 'The text was archived successfully');
            } else {
              notice.push(notice.SUCCESS, 'The texts were archived successfully');
            }
          }
        });
      }, () => {});
    };

    // Add Text
    $scope.addText = function addText(): void {
      //    console.log("addText()");
      const text = {
        id: '',
        title: $scope.title,
        content: $scope.content,
        startCh: $scope.startCh,
        startVs: $scope.startVs,
        endCh: $scope.endCh,
        endVs: $scope.endVs,
        fontfamily: $scope.fontfamily
      } as Text;
      textService.update(text).then((result: JsonRpcResult) => {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'The text \'' + text.title + '\' was added successfully');
        }

        $scope.getPageDto();
      });
    };

    $scope.rangeSelectorCollapsed = true;
    $scope.toggleRangeSelector = function toggleRangeSelector(): void {
      $scope.rangeSelectorCollapsed = !$scope.rangeSelectorCollapsed;
    };

    $scope.enhanceDto = function enhanceDto(texts: Text[]): void {
      for (const text of texts) {
        text.url = linkService.text(text.id);
      }
    };

    $scope.readUsx = function readUsx(file: UploadFile): void {
      util.readUsxFile(file).then((usx: string) => {
        $scope.$applyAsync(() => {
          $scope.content = usx;
        });
      }).catch((errorMessage: string) => {
        $scope.$applyAsync(() => {
          notice.push(notice.ERROR, errorMessage);
          $scope.content = '';
        });
      });
    };

    $scope.getPageDto();

    siteWideNoticeService.displayNotices();

  }])
  .name;
