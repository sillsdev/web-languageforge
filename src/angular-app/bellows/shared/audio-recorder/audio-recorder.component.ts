import * as angular from 'angular';
import * as lamejs from 'lamejs';

declare var webkitAudioContext: {
  new(): AudioContext;
};

export class AudioRecorderController implements angular.IController {

  static $inject = ['$interval', '$scope'];
  constructor(private $interval: angular.IIntervalService, private $scope: angular.IScope) {}

  isRecording = false;
  hasRecorded = false;
  audioSrc: string;
  blob: Blob;
  recordingTime: string;
  errorMessage: string;
  stopMediaStream: () => void;
  callback: (blob: Blob) => void;
  interval: angular.IPromise<void>;

  toggleRecording() {
    if (this.isRecording) this.stopRecording();
    else this.startRecording();
    this.isRecording = !this.isRecording;
  }

  close() {
    this.stopRecording();
    this.callback(null);
  }

  saveAudio() {
    this.callback(this.blob);
  }

  recordingSupported() {
    return navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia &&
      ((window as any).AudioContext || (window as any).webkitAudioContext);
  }

  $onDestroy() {
    this.stopRecording();
  }

  private startRecording() {
    this.recordingTime = '0:00';

    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {

      this.$scope.$apply(() => {
        this.hasRecorded = true;
        this.errorMessage = null;
        this.isRecording = true;
      });

      const recordingStartTime = new Date();
      // webkit prefix required for Safari
      const context = (window as any).AudioContext ? new AudioContext() : new webkitAudioContext();
      const bufferSize = 0;
      const channels = 1;
      const processor = context.createScriptProcessor(bufferSize, channels, channels);
      context.createMediaStreamSource(stream).connect(processor);
      processor.connect(context.destination);
      const sampleRate = context.sampleRate;
      const bitrate = 128;
      const mp3Encoder = new MP3Encoder(channels, sampleRate, bitrate);

      function handleAudioData(event: AudioProcessingEvent) {
        mp3Encoder.appendData(event.inputBuffer.getChannelData(0));
      }
      processor.addEventListener('audioprocess', handleAudioData);

      mp3Encoder.onMp3Blob(blob => {
        this.blob = blob;
        this.audioSrc = URL.createObjectURL(blob);
      });

      this.interval = this.$interval(() => {
        const seconds = Math.floor((new Date().getTime() - recordingStartTime.getTime()) / 1000);
        this.recordingTime = Math.floor(seconds / 60) + ':' + (seconds % 60 < 10 ? '0' : '') + seconds % 60;
      }, 1000);

      this.stopMediaStream = () => {
        processor.removeEventListener('audioprocess', handleAudioData);
        mp3Encoder.end();
        stream.getAudioTracks()[0].stop();
      };

    }, err => {
      this.$scope.$apply(() => {
        this.errorMessage = 'Unable to record audio from your microphone.';
        this.isRecording = false;
        this.hasRecorded = false;
      });
      console.error(err);
    });
  }

  private stopRecording() {
    if (this.interval) this.$interval.cancel(this.interval);
    if (this.stopMediaStream) this.stopMediaStream();
  }

}

export class MP3Encoder {

  constructor(private channels: number, private sampleRate: number, private bitrate: number) {}

  buffer: Float32Array[] = [];
  mp3BlobListeners: Array<(data: Blob) => void> = [];

  lame = new lamejs.Mp3Encoder(this.channels, this.sampleRate, this.bitrate);

  appendData(data: Float32Array) {
    // copy the data, because Chromium 66.0.3359.139 overwrites it (FF 60.0.1 does not)
    this.buffer.push(data.slice(0, data.length));
  }

  end() {
    // Flatten the buffer array while converting it from Float32 to Int16
    const pcmData = new Int16Array(this.buffer.length * this.buffer[0].length);

    // max and min 16-bit values
    const max = 0x7FFF;
    const min = 0x8000;
    let index = 0;
    for (let i = 0, len1 = this.buffer.length; i < len1; ++i) {
      const chunk = this.buffer[i];
      for (let j = 0, len2 = chunk.length; j < len2; ++j) {
        pcmData[index] = chunk[j] < 0 ? chunk[j] * min : chunk[j] * max;
        ++index;
      }
    }

    const blockSize = 1152;
    const mp3Data: Int8Array[] = [];

    let encoded: Int8Array;
    for (let i = 0; i < pcmData.length; i += blockSize) {
      const chunk = pcmData.subarray(i, i + blockSize);
      // This line takes the most time of this function, about 90%
      encoded = this.lame.encodeBuffer(chunk);
      if (chunk.length > 0) mp3Data.push(new Int8Array(encoded));
    }

    encoded = this.lame.flush();
    if (encoded.length > 0) mp3Data.push(new Int8Array(encoded));
    const blob = new Blob(mp3Data, {type: 'audio/mp3'});

    this.mp3BlobListeners.forEach(cb => cb(blob));
  }

  onMp3Blob(cb: (data: Blob) => void) {
    this.mp3BlobListeners.push(cb);
  }
}

export const AudioRecorderComponent: angular.IComponentOptions = {
  bindings: {
    callback: '<' // TODO probably change to > or <, not sure which
  },
  controller: AudioRecorderController,
  templateUrl: '/angular-app/bellows/shared/audio-recorder/audio-recorder.component.html'
};
