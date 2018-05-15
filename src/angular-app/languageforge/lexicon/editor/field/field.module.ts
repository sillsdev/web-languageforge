import * as angular from 'angular';

import {NoticeModule} from '../../../../bellows/core/notice/notice.module';
import {MockModule} from '../../../../bellows/shared/mock.module';
import {SoundModule} from '../../../../bellows/shared/sound.module';
import {FieldAudioComponent} from './dc-audio.component';
import {FieldEntryModule} from './dc-entry.component';
import {FieldMultiOptionListComponent} from './dc-multioptionlist.component';
import {FieldMultiTextComponent} from './dc-multitext.component';
import {FieldOptionListComponent} from './dc-optionlist.component';
import {FieldRenderedModule} from './dc-rendered.component';
import {FieldTextComponent} from './dc-text.component';

export const EditorFieldModule = angular
  .module('editorFieldModule', [
    'ngFileUpload',
    'lexCommentsModule',
    FieldRenderedModule,
    FieldEntryModule,
    MockModule,
    NoticeModule,
    SoundModule
  ])
  .component('dcAudio', FieldAudioComponent)
  .component('dcMultioptionlist', FieldMultiOptionListComponent)
  .component('dcMultitext', FieldMultiTextComponent)
  .component('dcOptionlist', FieldOptionListComponent)
  .component('dcText', FieldTextComponent)
  .name;
