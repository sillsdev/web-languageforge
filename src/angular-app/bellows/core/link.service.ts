import * as angular from 'angular';

export interface LinkService {
  href(url: string, text: string): string;
  project(projectId?: string, projectType?: string): string;
  user(userId: string): string;
  settings(projectId: string): string;

  text(textId: string, projectId?: string): string;
  question(textId: string, questionId: string, projectId?: string): string;

  entry(entryId: string, projectId?: string): string;
}

export function LinkService() {

  /** shared section */

  this.href = function href(url: string, text: string): string {
    return '<a href="' + url + '">' + text + '</a>';
  };

  this.project = function project(projectId?: string, projectType: string = 'sfchecks'): string {
    if (angular.isDefined(projectId)) {
      return '/app/' + projectType + '/' + projectId + '#!/';
    } else {
      return '#!/';
    }
  };

  this.user = function user(userId: string): string {
    return '/app/userprofile/' + userId;
  };

  this.settings = function settings(projectId: string): string {
    return this.project(projectId) + '/settings';
  };

  /** sfchecks section */

  this.text = function text(textId: string, projectId?: string): string {
    if (angular.isDefined(projectId)) {
      return this.project(projectId) + textId;
    } else {
      return this.project() + textId;
    }
  };

  this.question = function question(textId: string, questionId: string, projectId?: string): string {
    if (angular.isDefined(projectId)) {
      return this.text(textId, projectId) + '/' + questionId;
    } else {
      return this.text(textId) + '/' + questionId;
    }
  };

  /** lexicon section */

  this.entry = function entry(entryId: string, projectId?: string): string {
    if (angular.isDefined(projectId)) {
      // TODO: Replace hardcoded 'lexicon' below
      return this.project(projectId, 'lexicon') + '/editor/entry/' + entryId;
    } else {
      return '#!/editor/entry/' + entryId;
    }
  };

}
