import { webmFixDuration } from "webm-fix-duration";
import * as angular from "angular";

export class AudioRecorderController implements angular.IController {
  static $inject = ["$interval", "$scope"];

  mediaRecorder: MediaRecorder;
  chunks: string[] = [];
  isRecording = false;
  hasRecorded = false;
  recordingStartTime: Date;
  audioSrc: string;
  blob: Blob;
  recordingTime: string;
  errorMessage: string;
  callback: (blob: Blob) => void;
  durationInMilliseconds: number;
  interval: angular.IPromise<void>;

  constructor(
    private $interval: angular.IIntervalService,
    private $scope: angular.IScope
  ) {}

  private startRecording() {
    this.recordingTime = "0:00";

    navigator.mediaDevices.getUserMedia({ audio: true }).then(
      (stream) => {
        this.mediaRecorder = new MediaRecorder(stream);

        this.$scope.$apply(() => {
          this.hasRecorded = true;
          this.errorMessage = null;
          this.isRecording = true;
        });

        this.mediaRecorder.addEventListener(
          "dataavailable",
          async (e: { data: any }) => {
            this.chunks.push(e.data);
            var roughBlob = new Blob(this.chunks, {
              type: "audio/webm; codecs=opus",
            });
            //In some browsers (Chrome, Edge, ...) navigator.mediaDevices.getUserMedia with MediaRecorder creates WEBM files without duration metadata  //2022-09
            //webmFixDuration appends missing duration metadata to a WEBM file blob.
            this.blob = await webmFixDuration(
              roughBlob,
              this.durationInMilliseconds,
              "audio/webm; codecs=opus"
            );
            this.chunks = [];
            this.audioSrc = window.URL.createObjectURL(this.blob);
            this.$scope.$digest();
          }
        );

        this.recordingStartTime = new Date();

        this.interval = this.$interval(() => {
          const seconds = Math.floor(
            (new Date().getTime() - this.recordingStartTime.getTime()) / 1000
          );
          this.recordingTime =
            Math.floor(seconds / 60) +
            ":" +
            (seconds % 60 < 10 ? "0" : "") +
            (seconds % 60);
        }, 1000);

        this.mediaRecorder.start();
      },
      (err) => {
        this.$scope.$apply(() => {
          this.errorMessage = "Unable to record audio from your microphone.";
          this.isRecording = false;
          this.hasRecorded = false;
        });

        console.error(err);
      }
    );
  }

  private stopRecording() {
    this.durationInMilliseconds = Math.floor(
      new Date().getTime() - this.recordingStartTime.getTime()
    );

    this.mediaRecorder.stop();

    if (this.interval) {
      this.$interval.cancel(this.interval);
    }
  }

  toggleRecording() {
    if (this.isRecording) this.stopRecording();
    else this.startRecording();
    this.isRecording = !this.isRecording;
  }

  close() {
    if (this.isRecording) {
      this.stopRecording();
    }
    this.callback(null);
  }

  saveAudio() {
    this.callback(this.blob);
  }

  recordingSupported() {
    return (
      navigator.mediaDevices &&
      navigator.mediaDevices.enumerateDevices &&
      navigator.mediaDevices.getUserMedia &&
      ((window as any).AudioContext || (window as any).webkitAudioContext)
    );
  }

  $onDestroy() {
    if (this.isRecording) {
      this.stopRecording();
    }
  }
}

export const AudioRecorderComponent: angular.IComponentOptions = {
  bindings: {
    callback: "<",
  },
  controller: AudioRecorderController,
  templateUrl:
    "/angular-app/bellows/shared/audio-recorder/audio-recorder.component.html",
};
