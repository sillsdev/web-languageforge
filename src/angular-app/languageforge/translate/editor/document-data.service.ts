import * as angular from 'angular';
import { DocumentData } from './document-data';
import { RangeStatic } from 'quill';

export class DocumentDataService {
  static $inject: string[] = ['$q'];
  constructor(private $q: angular.IQService) {}

  createDocumentData(docType: string, label: string): DocumentData {
    return new DocumentData(this.$q, docType, label);
  }

  removeTrailingCarriageReturn(text: string): string {
    return DocumentData.removeTrailingCarriageReturn(text);
  }

  isTextEmpty(text: string): boolean {
    return DocumentData.isTextEmpty(text);
  }

  hasNoSelectionAtCursor(range: RangeStatic): boolean {
    return DocumentData.hasNoSelectionAtCursor(range);
  }
}
