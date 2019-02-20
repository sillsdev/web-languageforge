import { OtJson0Op } from 'ot-json0';

import { RealtimeData } from 'xforge-common/models/realtime-data';
import { RealtimeDoc } from 'xforge-common/realtime-doc';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { Question } from './question';

export class QuestionData extends RealtimeData<Question[], OtJson0Op[]> {
  static readonly TYPE = 'question';

  constructor(doc: RealtimeDoc, store: RealtimeOfflineStore) {
    super(QuestionData.TYPE, doc, store);
  }

  insertInList(newQuestion: Question, index: number = 0): QuestionData {
    super.submit([{ p: [index], li: newQuestion }]);
    return this; // so that operations can be chained
  }

  replaceInList(question: Question, newQuestion: Question, index: number = 0): QuestionData {
    super.submit([{ p: [index], ld: question, li: newQuestion }]);
    return this;
  }

  deleteFromList(question: Question, index: number = 0): QuestionData {
    super.submit([{ p: [index], ld: question }]);
    return this;
  }

  moveInList(indexFrom: number, indexTo: number): QuestionData {
    super.submit([{ p: [indexFrom], lm: indexTo }]);
    return this;
  }

  /** Other operations that could be added if needed:
   * Number Add
   * Object Insert
   * Object Replace
   * Object Delete
   * Subtype
   * String Insert
   * String Delete
   */

  async submit(ops: OtJson0Op[], source?: any): Promise<void> {
    throw new SyntaxError('Use access methods instead of submit.');
  }

  protected prepareDataForStore(data: Question[]): any {
    return data;
  }
}
