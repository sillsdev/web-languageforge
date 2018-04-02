import * as angular from 'angular';

import {SoundComponent} from './sound-player.component';

export const SoundModule = angular
  .module('soundModule', [])
  .component('puiSoundplayer', SoundComponent)
  .name;
