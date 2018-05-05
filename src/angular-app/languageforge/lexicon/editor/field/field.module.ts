import * as angular from 'angular';

import {NoticeModule} from '../../../../bellows/core/notice/notice.module';
import {MockModule} from '../../../../bellows/shared/mock.module';
import {SoundModule} from '../../../../bellows/shared/sound.module';
import {FieldAudioComponent} from './dc-audio.component';
import {FieldEntryComponent} from './dc-entry.component';
import {FieldExampleComponent} from './dc-example.component';
import {FieldRepeatComponent} from './dc-fieldrepeat.component';
import {FieldMultiOptionListComponent} from './dc-multioptionlist.component';
import {FieldMultiParagraphComponent} from './dc-multiparagraph.component';
import {FieldMultiTextComponent} from './dc-multitext.component';
import {FieldOptionListComponent} from './dc-optionlist.component';
import {FieldPictureComponent} from './dc-picture.component';
import {FieldRenderedComponent} from './dc-rendered.component';
import {FieldSemanticDomainComponent} from './dc-semanticdomain.component';
import {FieldSenseComponent} from './dc-sense.component';
import {FieldTextComponent} from './dc-text.component';

export const EditorFieldModule = angular
  .module('editorFieldModule', [
    'ngFileUpload',
    'lexCommentsModule',
    MockModule,
    NoticeModule,
    SoundModule
  ])
  .component('dcAudio', FieldAudioComponent)
  .component('dcEntry', FieldEntryComponent)
  .component('dcExample', FieldExampleComponent)
  .component('dcFieldrepeat', FieldRepeatComponent)
  .component('dcMultioptionlist', FieldMultiOptionListComponent)
  .component('dcMultiparagraph', FieldMultiParagraphComponent)
  .component('dcMultitext', FieldMultiTextComponent)
  .component('dcOptionlist', FieldOptionListComponent)
  .component('dcPicture', FieldPictureComponent)
  .component('dcRendered', FieldRenderedComponent)
  .component('dcSemanticdomain', FieldSemanticDomainComponent)
  .component('dcSense', FieldSenseComponent)
  .component('dcText', FieldTextComponent)
  .name;
