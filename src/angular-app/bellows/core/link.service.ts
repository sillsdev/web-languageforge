import * as angular from 'angular';

export interface LinkService {
  href(url: string, text: string): string;
  project(projectId?: string, projectType?: string): string;
  user(userId: string): string;
  settings(projectId: string): string;

  entry(entryId: string, projectId?: string): string;
}

export function LinkService() {

  /** shared section */

  this.href = function href(url: string, text: string): string {
    return '<a href="' + url + '">' + text + '</a>';
  };

  this.project = function project(projectId?: string, projectType: string = 'lexicon'): string {
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

  /** lexicon section */

  this.entry = function entry(entryId: string, projectId?: string): string {
    if (angular.isDefined(projectId)) {
      // TODO: Replace hardcoded 'lexicon' below
      return this.project(projectId, 'lexicon') + 'editor/entry/' + entryId;
    } else {
      return '#!/editor/entry/' + entryId;
    }
  };

}
