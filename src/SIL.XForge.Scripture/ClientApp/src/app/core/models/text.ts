import { ResourceRef } from '@xforge-common/models/resource';
import { SFProjectData } from './sfproject-data';

export class Text extends SFProjectData {
  static readonly TYPE = 'text';

  constructor(init?: Partial<Text>) {
    super(Text.TYPE, init);
  }

  name?: string;
  bookId?: string;
}

export class TextRef extends ResourceRef {
  static readonly TYPE = Text.TYPE;

  constructor(id: string) {
    super(TextRef.TYPE, id);
  }
}
