import { PageSpecifier } from '@orbit/data';

export interface IndexedPageSpecifier extends PageSpecifier {
  kind: 'indexed';
  index: number;
  size: number;
}
