import { BaseComponent } from "./base-component";
import { Locator } from "@playwright/test";

export class AudioPlayer extends BaseComponent {

  readonly togglePlaybackAnchor = this.locator('[ng-click="$ctrl.togglePlayback()"]');
  readonly playIcon = this.locator('i.fa-play');
  readonly dropdownToggle = this.locator('a.dropdown-toggle');
  readonly uploadButton = this.locator('button.upload-audio');
  readonly downloadButton = this.locator('a.buttonAppend');
  readonly slider = this.locator('input.seek-slider');
  readonly audioProgressTime = this.locator('span.audio-progress');
  readonly browseButton = this.locator('#browseButton');

  readonly dropdownMenu = {
    uploadReplacementButton: this.locator('a >> text=Upload a replacement'),
    deleteAudioButton: this.locator('a >> text=Delete'),
  };

  constructor(locator: Locator) {
    super(locator);
  }
}
