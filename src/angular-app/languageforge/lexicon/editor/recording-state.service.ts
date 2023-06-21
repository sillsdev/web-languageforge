import * as angular from 'angular';

export class RecordingStateService {
  static $inject: string[] = ['$q'];

  private hasUnresolvedRecording = false;
  private uploads$: angular.IPromise<unknown>[] = [];

  constructor(private readonly $q: angular.IQService) {
  }

  startRecording(): boolean {
    if (this.hasUnresolvedRecording) {
      return false;
    } else {
      this.hasUnresolvedRecording = true;
      return true;
    }
  }

  resolveRecording(): void {
    this.hasUnresolvedRecording = false;
  }

  startUploading(upload: angular.IPromise<unknown>): void {
    this.uploads$.push(upload);
    upload.finally(() =>
      this.uploads$ = this.uploads$.filter(_upload => _upload !== upload)
    );
  }

  uploading$(): angular.IPromise<unknown> {
    return this.$q.all(this.uploads$);
  }

  hasUnsavedChanges(): boolean {
    return this.hasUnresolvedRecording || this.uploads$.length > 0;
  }
}
