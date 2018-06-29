import * as angular from 'angular';

import {AudioRecorderComponent} from './audio-recorder.component';

export const AudioRecorder = angular
  .module('audioRecorder', [])
  .component('puiAudioRecorder', AudioRecorderComponent)
  .name;
