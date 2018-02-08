import * as angular from 'angular';

import { InputSystemsModule } from '../../bellows/core/input-systems/input-systems.service';
import { LexiconCoreModule } from './core/lexicon-core.module';
import { LexiconConfigurationModule } from './settings/configuration/configuration.module';

export const LexiconModule = angular
  .module('lexiconModule', [InputSystemsModule, LexiconCoreModule, LexiconConfigurationModule])
  .name;
