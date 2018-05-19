import * as angular from 'angular';
import 'angular-sanitize';

import {InputSystemsModule} from '../../bellows/core/input-systems/input-systems.service';
import {SoundModule} from '../../bellows/shared/sound.module';
import {LexiconCoreModule} from './core/lexicon-core.module';
import {LexiconEditorModule} from './editor/editor.module';
import {LexiconNewProjectModule} from './new-project/lexicon-new-project.module';
import {LexiconSettingsModule} from './settings/settings.module';

export const LexiconModule = angular
  .module('lexiconModule', [
    InputSystemsModule,
    LexiconCoreModule,
    LexiconEditorModule,
    LexiconNewProjectModule,
    LexiconSettingsModule,
    SoundModule
  ])
  .name;
