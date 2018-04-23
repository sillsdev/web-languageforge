import * as angular from 'angular';

import {NoticeModule} from '../../../../bellows/core/notice/notice.module';
import {MockModule} from '../../../../bellows/shared/mock.module';
import {SoundModule} from '../../../../bellows/shared/sound.module';
import {FieldAudioComponent} from './dc-audio.component';
import {FieldTextComponent} from './dc-text.component';

export const EditorFieldModule = angular
  .module('editorFieldModule', [
    'ngFileUpload',
    MockModule,
    NoticeModule,
    SoundModule
  ])
  .component('dcAudio', FieldAudioComponent)
  .component('dcText', FieldTextComponent)
  .name;
