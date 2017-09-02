import * as angular from 'angular';

import { SessionService } from '../../bellows/core/session.service';
import { Rights, TranslateRightsService } from './core/translate-rights.service';

export class TranslateAppController implements angular.IController {
  project: any;
  rights: Rights;
  interfaceConfig: any;

  static $inject = ['$state', 'sessionService', 'translateRightsService', '$q'];
  constructor(private $state: angular.ui.IStateService, private sessionService: SessionService,
              private rightsService: TranslateRightsService, private $q: angular.IQService) {}

  $onInit() {
    this.$q.all([this.sessionService.getSession(), this.rightsService.getRights()]).then((data) => {
      const session = data[0];
      const rights = data[1];

      this.project = session.project();
      this.rights = rights;
      this.rights.showSettingsDropdown = () => {
        return this.rights.canEditProject() || this.rights.canEditUsers() ||
          this.rights.canEditEntry();
      };

      // this.interfaceConfig = sessionService.session.projectSettings.interfaceConfig;
      this.interfaceConfig = {};
      this.interfaceConfig.direction = 'ltr';
      this.interfaceConfig.pullToSide = 'pull-right';
      this.interfaceConfig.pullNormal = 'pull-left';
      this.interfaceConfig.placementToSide = 'left';
      this.interfaceConfig.placementNormal = 'right';
    });
  }

  gotoTranslation() {
    this.$state.go('editor');
  }

  showTranslationButton() {
    return !this.$state.is('editor');
  }

  onUpdateProject($event: { project: any }) {
    this.project = $event.project;
  }

}

export const TranslateAppComponent: angular.IComponentOptions = {
  templateUrl: '/angular-app/languageforge/translate/translate-app.component.html',
  controller: TranslateAppController
};
