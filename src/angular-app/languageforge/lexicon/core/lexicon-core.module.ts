import * as angular from 'angular';

import {BreadcrumbModule} from '../../../bellows/core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../../bellows/core/core.module';
import {HelpHeroService} from '../../../bellows/core/helphero.service';
import {SemanticDomainsModule} from '../../core/semantic-domains/semantic-domains.service';
import {LexiconConfigService} from './lexicon-config.service';
import {LexiconEditorDataService} from './lexicon-editor-data.service';
import {LexiconEntryApiService} from './lexicon-entry-api.service';
import {LexiconLinkService} from './lexicon-link.service';
import {LexiconProjectService} from './lexicon-project.service';
import {LexiconRightsService} from './lexicon-rights.service';
import {LexiconSendReceiveApiService} from './lexicon-send-receive-api.service';
import {LexiconSendReceiveService} from './lexicon-send-receive.service';
import {LexiconUtilityService} from './lexicon-utility.service';

export const LexiconCoreModule = angular
  .module('lexiconCoreModule', [
    BreadcrumbModule,
    CoreModule,
    SemanticDomainsModule
  ])
  .service('lexProjectService', LexiconProjectService)
  .service('lexLinkService', LexiconLinkService)
  .service('lexConfigService', LexiconConfigService)
  .service('lexEditorDataService', LexiconEditorDataService)
  .service('lexEntryApiService', LexiconEntryApiService)
  .service('lexRightsService', LexiconRightsService)
  .service('lexSendReceiveApi', LexiconSendReceiveApiService)
  .service('lexSendReceive', LexiconSendReceiveService)
  .service('lexUtils', LexiconUtilityService)
  .service('helpHeroService', HelpHeroService)
  .name;
