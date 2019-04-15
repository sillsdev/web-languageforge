import { TextBase } from './sfdomain-model.generated';

/** Documents in the texts collection in the database represent the metadata
 * for a Scripture book. They are not necessarily for a book in a specific
 * paratext project (eg mother or daughter), but represent metadata for a
 * book in a given SF site project. */
export class Text extends TextBase {}

export { Chapter, TextRef } from './sfdomain-model.generated';
