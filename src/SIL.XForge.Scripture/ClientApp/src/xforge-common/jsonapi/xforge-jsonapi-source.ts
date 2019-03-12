import { Query, Record, Transform } from '@orbit/data';
import JSONAPISource from '@orbit/jsonapi';

import { getRequestType } from '../request-type';
import { QueryOperator, QueryOperators } from './query-operators';

export class XForgeJSONAPISource extends JSONAPISource {
  constructor(settings = {}) {
    super(settings);
  }

  async _push(transform: Transform): Promise<Transform[]> {
    const transforms = await super._push(transform);
    for (const t of transforms) {
      if (t.options == null) {
        t.options = {};
      }
      t.options.requestType = getRequestType(transform);
    }
    return transforms;
  }

  async _pull(query: Query): Promise<Transform[]> {
    const operator: QueryOperator = QueryOperators[query.expression.op];
    if (!operator) {
      throw new Error(`JSONAPISource does not support the \`${query.expression.op}\` operator for queries.`);
    }
    const response = await operator(this, query);
    if (response.meta != null) {
      query.options.totalPagedCount = response.meta['total-records'];
    }
    for (const t of response.transforms) {
      if (t.options == null) {
        t.options = {};
      }
      t.options.requestType = getRequestType(query);
    }
    return response.transforms;
  }

  async _query(query: Query): Promise<Record | Record[]> {
    const operator: QueryOperator = QueryOperators[query.expression.op];
    if (!operator) {
      throw new Error(`JSONAPISource does not support the \`${query.expression.op}\` operator for queries.`);
    }
    const response = await operator(this, query);
    if (response.meta != null) {
      query.options.totalPagedCount = response.meta['total-records'];
    }
    for (const t of response.transforms) {
      if (t.options == null) {
        t.options = {};
      }
      t.options.requestType = getRequestType(query);
    }
    await this._transformed(response.transforms);
    return response.primaryData;
  }
}
