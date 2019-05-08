import { OtJson0Op, OtJson0Path } from 'ot-json0';
import { RealtimeData } from './realtime-data';

/** See https://github.com/ottypes/json0 */
export abstract class JsonData<T = any> extends RealtimeData<T[], OtJson0Op[]> {
  insertInList(newItem: any, path: OtJson0Path = [0]): JsonData<T> {
    super.submit([{ p: path, li: newItem }]);
    return this; // so that operations can be chained
  }

  replaceInList(item: any, newItem: any, path: OtJson0Path = [0]): JsonData<T> {
    super.submit([{ p: path, ld: item, li: newItem }]);
    return this;
  }

  deleteFromList(item: any, path: OtJson0Path = [0]): JsonData<T> {
    super.submit([{ p: path, ld: item }]);
    return this;
  }

  moveInList(pathFrom: OtJson0Path, indexTo: number): JsonData<T> {
    super.submit([{ p: pathFrom, lm: indexTo }]);
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

  async submit(_ops: OtJson0Op[], _source?: any): Promise<void> {
    throw new SyntaxError('Use access methods instead of submit.');
  }
}
