import * as angular from 'angular';
import {LexiconConfig} from '../../shared/model/lexicon-config.model';
import {CommentsOfflineCacheService} from '../../../../bellows/core/offline/comments-offline-cache.service';
import {EditorOfflineCacheService} from '../../../../bellows/core/offline/editor-offline-cache.service';

export class AdvancedOptionsConfigurationController implements angular.IController {
  accPollUpdateTimerSecondsDirty: number;
  accOnUpdate: (params: { $event: { pollUpdateTimerSecondsDirty: number } }) => void;

  static $inject: string[] = ['$scope', 'editorOfflineCache', 'commentsOfflineCache',];
  constructor(
    private $scope: angular.IScope,
    private editorOfflineCache: EditorOfflineCacheService,
    private commentsOfflineCache: CommentsOfflineCacheService,
    ) {
    $scope.$watch(
      () => this.accPollUpdateTimerSecondsDirty,
      (newVal: number, oldVal: number) => {
        if (newVal != null && newVal !== oldVal) {
          this.accOnUpdate({ $event: { pollUpdateTimerSecondsDirty: this.accPollUpdateTimerSecondsDirty } });
        }
      },
      true
    );
  }

  async resetLocalStorage() {
    await this.editorOfflineCache.deleteAllEntries();
    await this.commentsOfflineCache.deleteAllComments();
    window.location.hash = '#!/';
    window.location.reload(); // To force the redownload
  }

  $onChanges(changes: any) {
    const configChange = changes.accConfigPristine as angular.IChangesObject<LexiconConfig>;
    if (configChange != null && configChange.currentValue != null) {
      const ms = configChange.currentValue.pollUpdateIntervalMs;
      if (ms != null) {
        this.accPollUpdateTimerSecondsDirty = ms / 1000;
      }
    }
  }
}

export const AdvancedOptionsConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    accPollUpdateTimerSecondsDirty: '<',
    accConfigPristine: '<',
    accOnUpdate: '&'
  },
  controller: AdvancedOptionsConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-advanced-options.component.html'
};
