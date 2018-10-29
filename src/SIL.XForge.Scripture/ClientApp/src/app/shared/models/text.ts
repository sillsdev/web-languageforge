import { resource, ResourceRef, resourceRef } from '@xforge-common/models/resource';
import { SFProjectData } from './sfproject-data';

@resource
export class Text extends SFProjectData {
  static readonly TYPE = 'text';

  constructor(init?: Partial<Text>) {
    super(Text.TYPE, init);
  }

  name?: string;
  bookId?: string;
}

@resourceRef
export class TextRef extends ResourceRef {
  static readonly TYPE = Text.TYPE;

  constructor(id: string) {
    super(TextRef.TYPE, id);
  }
}
