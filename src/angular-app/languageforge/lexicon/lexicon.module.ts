import * as angular from 'angular';

import {InputSystemsModule} from '../../bellows/core/input-systems/input-systems.service';
import {LexiconCoreModule} from './core/lexicon-core.module';
import {LexiconSettingsModule} from './settings/settings.module';

export const LexiconModule = angular
  .module('lexiconModule', [InputSystemsModule, LexiconCoreModule, LexiconSettingsModule])
  .name;
