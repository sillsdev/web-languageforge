import * as angular from 'angular';
import * as localforage from 'localforage';

import {SessionService} from '../session.service';
import {OfflineCacheService} from './offline-cache.service';

export interface VotesDto { [id: string]: boolean; }

export class OfflineCacheUtilsService {
  private readonly INTERFACE_KEY_LANGUAGE_CODE = 'languageCode';
  private readonly interfaceStore = localforage.createInstance({ name: 'interface' });

  static $inject: string[] = ['$q', 'sessionService',
    'offlineCache'];
  constructor(private readonly $q: angular.IQService, private readonly sessionService: SessionService,
              private readonly offlineCache: OfflineCacheService) { }

  getProjectData(): angular.IPromise<any> {
    return this.offlineCache.getOneFromStore('projects', this.sessionService.projectId());
  }

  updateProjectData(timestamp: number, commentsUserPlusOne: VotesDto, isComplete: boolean): angular.IPromise<any> {
    const obj = {
      id: this.sessionService.projectId(),
      commentsUserPlusOne,
      timestamp,
      isComplete
    };
    return this.offlineCache.setObjectsInStore('projects', this.sessionService.projectId(), [obj]);
  }

  getInterfaceLanguageCode(): angular.IPromise<any> {
    return this.$q.when(this.interfaceStore.getItem<string>(this.INTERFACE_KEY_LANGUAGE_CODE));
  }

  updateInterfaceLanguageCode(languageCode: string): angular.IPromise<any> {
    return this.$q.when(this.interfaceStore.setItem<string>(this.INTERFACE_KEY_LANGUAGE_CODE, languageCode));
  }

}
