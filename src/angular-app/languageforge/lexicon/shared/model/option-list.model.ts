export class LexOptionListItem {
  abbreviation: string;
  guid: string;
  key: string;
  value: string;
}

export class LexOptionList {
  // noinspection JSUnusedGlobalSymbols
  canDelete: boolean;
  code: string;
  dateCreated: string;
  dateModified: string;
  // noinspection JSUnusedGlobalSymbols
  defaultItemKey: string;
  id: string;
  items: LexOptionListItem[];
  name: string;
}
