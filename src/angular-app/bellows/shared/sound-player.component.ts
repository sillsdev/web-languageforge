import * as angular from 'angular';

export class SoundController implements angular.IController {
  puiUrl: string;

  audioElement = document.createElement('audio');
  playing = false;

  private isUserMovingSlider: boolean = false;
  private readonly slider = document.getElementById('puiSoundplayerSlider') as HTMLInputElement;

  static $inject = ['$scope'];
  constructor(private $scope: angular.IScope) { }

  $onInit(): void {
    this.audioElement.addEventListener('ended', () => {
      this.$scope.$apply(() => {
        if (this.playing) {
          this.togglePlayback();
        }

        this.audioElement.currentTime = 0;
      });
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.$scope.$digest();
    });

    const previousFormattedTime: string = null;
    this.audioElement.addEventListener('timeupdate', () => {
      if (!this.isUserMovingSlider) {
        this.slider.value = '' + this.audioElement.currentTime;
      }

      // If the time as shown the user has changed, only then run a digest
      if (previousFormattedTime !== this.currentTime()) {
        this.$scope.$digest();
      }
    });

    this.slider.addEventListener('change', (event: Event) => {
      const slider = event.target as HTMLInputElement;
      this.audioElement.currentTime = +slider.value;
      this.isUserMovingSlider = false;
    });

    this.slider.addEventListener('input', () => {
      this.isUserMovingSlider = true;
    });

  }

  $onChanges(changes: angular.IOnChangesObject): void {
    const urlChange = changes.puiUrl as angular.IChangesObject<string>;
    if (urlChange != null && urlChange.currentValue) {
      if (this.playing) {
        this.togglePlayback();
      }

      this.audioElement.src = urlChange.currentValue;
    }
  }

  $onDestroy(): void {
    this.audioElement.pause();
  }

  iconClass(): string {
    return this.playing ? 'fa-pause' : 'fa-play';
  }

  togglePlayback(): void {
    this.playing = !this.playing;

    if (this.playing) {
      this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  currentTimeInSeconds(): number {
    return this.audioElement.currentTime;
  }

  durationInSeconds(): number {
    return this.audioElement.duration;
  }

  duration(): string {
    return SoundController.formatTimestamp(this.audioElement.duration * 1000);
  }

  currentTime(): string {
    return SoundController.formatTimestamp(this.audioElement.currentTime * 1000);
  }

  private static formatTimestamp(timestamp: number): string {
    const totalSeconds = timestamp / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const secondsStr = (seconds < 10 ? '0' : '') + seconds;
    return minutes + ':' + secondsStr;
  }
}

export const SoundComponent: angular.IComponentOptions = {
  bindings: {
    puiUrl: '<'
  },
  controller: SoundController,
  templateUrl: '/angular-app/bellows/shared/sound-player.component.html'
};
