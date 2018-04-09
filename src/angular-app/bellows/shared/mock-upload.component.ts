import * as angular from 'angular';

class MockFile {
  name: string;
  size: number;
}

export class MockUploadController implements angular.IController {
  puiDoUpload: (params: any) => void;

  mockFile: MockFile = new MockFile();
  showControls: boolean = false;

  static $inject: string[] = [];
  constructor() { }

  toggleControls() {
    this.showControls = !this.showControls;
    this.mockFile = new MockFile();
  }

  doUpload() {
    // tslint:disable-next-line:max-line-length
    // see http://stackoverflow.com/questions/23477859/angularjs-call-function-on-directive-parent-scope-with-directive-scope-argumen
    this.puiDoUpload({ file: this.mockFile });
  }

}

export const MockUploadComponent: angular.IComponentOptions = {
  bindings: {
    puiDoUpload: '&'
  },
  controller: MockUploadController,
  templateUrl: '/angular-app/bellows/shared/mock-upload.component.html'
};
