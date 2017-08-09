import * as angular from 'angular';
import { QuillCustomization } from './quill.customization';

angular.module('quillService', [])

  // ensure service is eager loaded (rather than lazy loaded)
  .run(['quillCustomTheme', function () {}])

  // Customize the Bubble theme in Quill
  .service('quillCustomTheme', QuillCustomization.QuillCustomTheme)

  ;
