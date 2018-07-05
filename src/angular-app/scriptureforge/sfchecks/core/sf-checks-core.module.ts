import * as angular from 'angular';

import {ApiService} from '../../../bellows/core/api/api.service';
import {CoreModule} from '../../../bellows/core/core.module';

export interface SortData {
  sortColumn: string;
  direction: string;
  sort?: (cb: (objA: any, objB: any) => number) => void;
}

export const SfChecksCoreModule = angular
  .module('sfchecks.services', [CoreModule])
  .service('sfchecksProjectService', ['apiService', function sfchecksProjectService(api: ApiService) {
    this.read = api.method('project_read');
    this.update = api.method('project_update');
    this.projectSettings = api.method('project_settings');
    this.updateSettings = api.method('project_updateSettings');
    this.readSettings = api.method('project_readSettings');
    this.pageDto = api.method('project_pageDto');
  }])
  .service('messageService', ['apiService', function messageService(api: ApiService) {
    this.markRead = api.method('message_markRead');
    this.send = api.method('message_send');
  }])
  .service('textService', ['apiService', function questionService(api: ApiService) {
    this.read = api.method('text_read');
    this.update = api.method('text_update');
    this.archive = api.method('text_archive');
    this.publish = api.method('text_publish');
    this.settingsDto = api.method('text_settings_dto');
    this.exportComments = api.method('text_exportComments');
  }])
  .service('questionService', ['apiService', function questionService(api: ApiService) {
    this.read = api.method('question_comment_dto');
    this.update = api.method('question_update');
    this.archive = api.method('question_archive');
    this.publish = api.method('question_publish');
    this.list = api.method('question_list_dto');
    this.updateAnswer = api.method('question_update_answer');
    this.updateAnswerExportFlag = api.method('question_update_answerExportFlag');
    this.updateAnswerTags = api.method('question_update_answerTags');
    this.removeAnswer = api.method('question_remove_answer');
    this.updateComment = api.method('question_update_comment');
    this.removeComment = api.method('question_remove_comment');
    this.answerVoteUp = api.method('answer_vote_up');
    this.answerVoteDown = api.method('answer_vote_down');

    // Utility functions
    this.util = {};
    this.util.calculateTitle = function calculateTitle(title: string, description: string, charLimit: number = 50) {
      let questionTitleCalculated;
      if (!title || title === '') {
        const spaceIndex = description.indexOf(' ', charLimit);
        let shortTitle;
        if (spaceIndex > -1) {
          shortTitle = description.slice(0, spaceIndex) + '...';
        } else {
          shortTitle = description;
        }

        questionTitleCalculated = shortTitle;
      } else {
        questionTitleCalculated = title;
      }

      return questionTitleCalculated;
    };

  }])
  .service('questionTemplateService', ['apiService', function questionTemplateService(api: ApiService) {
    this.read = api.method('questionTemplate_read');
    this.update = api.method('questionTemplate_update');
    this.remove = api.method('questionTemplate_delete');
    this.list = api.method('questionTemplate_list');
  }])
  .service('listviewSortingService', function listviewSortingService() {
    this.sortDataByColumn = function sortDataByColumn(data: SortData, columnName: string, direction: string): SortData {
      // This function is as generic as possible, so that it could be reused easily in other code
      data.sort((objA: any, objB: any): number => {
        const a = objA[columnName];
        const b = objB[columnName];
        const aUndefined = (typeof a === 'undefined');
        const bUndefined = (typeof b === 'undefined');
        if (aUndefined && bUndefined) {
          return 0;
        } else if (aUndefined) {
          return (direction === 'up') ? -1 : +1;
        } else if (bUndefined) {
          return (direction === 'up') ? +1 : -1;
        } else {
          if (typeof a === 'string' && typeof b === 'string') {
            const sign = (direction === 'up') ? +1 : -1;
            return a.toLowerCase().localeCompare(b.toLowerCase()) * sign;
          } else {
            // number type
            if (a === b) {
              return 0;
            } else if (a < b) {
              return (direction === 'up') ? -1 : +1;
            } else {
              return (direction === 'up') ? +1 : -1;
            }
          }
        }
      });

      return data;
    };

    this.flipDirection = function flipDirection(direction: string): string {
      return (direction === 'up') ? 'down' : 'up';
    };

    // TODO: The sortdata parameter here should probably turn into some kind of class with
    // setSortColumn and sortIconClass methods

    this.setSortColumn = function setSortColumn(sortData: SortData, columnName: string): void {
      if (columnName === sortData.sortColumn) {
        sortData.direction = this.flipDirection(sortData.direction);
      } else {
        sortData.sortColumn = columnName;
        sortData.direction = 'up';
      }
    };

    this.sortIconClass = function sortIconClass(sortData: SortData, columnName: string): string {
      if (columnName === sortData.sortColumn && (sortData.direction === 'up' || sortData.direction === 'down')) {
        return 'fa fa-sort-' + sortData.direction;
      } else {
        return 'fa fa-sort';
      }
    };

  })
  .name;
