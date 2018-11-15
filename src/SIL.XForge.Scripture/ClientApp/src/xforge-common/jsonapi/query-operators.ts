import { buildTransform, Query, Record, Transform } from '@orbit/data';
import JSONAPISource, { JSONAPIDocument } from '@orbit/jsonapi';
import { Dict, toArray } from '@orbit/utils';
import { GetOperators } from './get-operators';

function deserialize(source: JSONAPISource, document: JSONAPIDocument, query: Query): QueryOperatorResponse {
  const deserialized = source.serializer.deserializeDocument(document);
  const records: Record[] = [];
  Array.prototype.push.apply(records, toArray(deserialized.data));

  if (deserialized.included) {
    Array.prototype.push.apply(records, deserialized.included);
  }

  const operations = records.map(record => {
    return {
      op: 'replaceRecord',
      record
    };
  });

  const transform = buildTransform(operations, query.options);
  if (query.options != null) {
    query.options.transformId = transform.id;
    if (document.meta != null) {
      query.options.totalPagedCount = document.meta['total-records'];
    }
    query.options.included = deserialized.included;
  }

  const transforms = [transform];
  const primaryData = deserialized.data;

  return { transforms, primaryData };
}

export interface QueryOperatorResponse {
  transforms: Transform[];
  primaryData: Record|Record[];
}

export type QueryOperator = (source: JSONAPISource, query: Query) => Promise<QueryOperatorResponse>;

export const QueryOperators: Dict<QueryOperator> = {
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
