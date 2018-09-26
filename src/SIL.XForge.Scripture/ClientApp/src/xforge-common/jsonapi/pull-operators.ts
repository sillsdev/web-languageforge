import { buildTransform, Query, Transform } from '@orbit/data';
import JSONAPISource, { JSONAPIDocument } from '@orbit/jsonapi';
import { Dict, toArray } from '@orbit/utils';

import { GetOperators } from './get-operators';

function deserialize(source: JSONAPISource, document: JSONAPIDocument, query: Query): Transform[] {
  const deserialized = source.serializer.deserializeDocument(document);
  const records = toArray(deserialized.data);

  if (deserialized.included) {
    Array.prototype.push.apply(records, deserialized.included);
  }

  const operations = records.map(record => {
    return {
      op: 'replaceRecord',
      record
    };
  });

  return [buildTransform(operations, query.options)];
}

export type PullOperator = (source: JSONAPISource, query: Query) => any;

export const PullOperators: Dict<PullOperator> = {
  findRecord(source: JSONAPISource, query: Query) {
    return GetOperators.findRecord(source, query)
      .then(data => deserialize(source, data, query));
  },

  findRecords(source: JSONAPISource, query: Query) {
    return GetOperators.findRecords(source, query)
      .then(data => deserialize(source, data, query));
  },

  findRelatedRecord(source: JSONAPISource, query: Query) {
    return GetOperators.findRelatedRecord(source, query)
      .then(data => deserialize(source, data, query));
  },

  findRelatedRecords(source: JSONAPISource, query: Query) {
    return GetOperators.findRelatedRecords(source, query)
      .then(data => deserialize(source, data, query));
  }
};
