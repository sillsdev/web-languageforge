import { QuestionBase } from './sfdomain-model.generated';

export class Question extends QuestionBase {
  source?: QuestionSource;
}

export { QuestionRef } from './sfdomain-model.generated';

export enum QuestionSource {
  Created = 'Created',
  Transcelerator = 'Transcelerator'
}
