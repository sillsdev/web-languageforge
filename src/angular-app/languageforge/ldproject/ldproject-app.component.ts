import * as angular from 'angular';

import {SiteWideNoticeService} from '../../bellows/core/site-wide-notice-service';
import {HelpHeroService} from '../../bellows/core/helphero.service';
import {NoticeService} from '../../bellows/core/notice/notice.service';
import {InterfaceConfig} from '../../bellows/shared/model/interface-config.model';
import {User} from '../../bellows/shared/model/user.model';

export class LdProjectAppController implements angular.IController {
  finishedLoading: boolean = false;
  interfaceConfig: InterfaceConfig = {} as InterfaceConfig;
  users: { [userId: string]: User } = {};

  private online: boolean;
  private pristineLanguageCode: string;

  static $inject = ['$scope', '$location',
    '$q',
    'silNoticeService',
    'siteWideNoticeService',
    'helpHeroService'];
  constructor(private readonly $scope: angular.IScope, private readonly $location: angular.ILocationService,
              private readonly $q: angular.IQService,
              private readonly notice: NoticeService,
              private readonly siteWideNoticeService: SiteWideNoticeService,
              private readonly helpHeroService: HelpHeroService) { }

  $onInit(): void {
  }

  $onDestroy(): void {
  }

  onUpdate = (
    $event: {
      foo?: string,
    }
  ): void => {
    if ($event.foo) {
    }
  }
}

export const LdProjectAppComponent: angular.IComponentOptions = {
  controller: LdProjectAppController,
  templateUrl: '/angular-app/languageforge/ldproject/ldproject-app.component.html'
};
