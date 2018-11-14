import {
  AttributeFilterSpecifier,
  AttributeSortSpecifier,
  FilterSpecifier,
  FindRecord,
  FindRecords,
  FindRelatedRecord,
  FindRelatedRecords,
  OffsetLimitPageSpecifier,
  QueryExpression,
  QueryExpressionParseError,
  Record,
  RecordIdentity,
  RecordNotFoundException,
  RelatedRecordFilterSpecifier,
  RelatedRecordsFilterSpecifier,
  SortSpecifier
} from '@orbit/data';
import { Cache } from '@orbit/store';
import { deepGet, Dict, isNone } from '@orbit/utils';

import { applyCustomFilter, CustomFilterSpecifier } from '../custom-filter-specifier';

/**
 * @export
 * @interface QueryOperator
 */
export type QueryOperator = (cache: Cache, expression: QueryExpression) => any;

export const QueryOperators: Dict<QueryOperator> = {
  findRecord(cache: Cache, expression: FindRecord) {
    const { type, id } = expression.record;
    const record = cache.records(type).get(id);

    if (!record) {
      throw new RecordNotFoundException(type, id);
    }

    return record;
  },

  findRecords(cache: Cache, expression: FindRecords) {
    let results = Array.from(cache.records(expression.type).values());
    if (expression.filter) {
      results = filterRecords(expression.type, results, expression.filter);
    }
    if (expression.sort) {
      results = sortRecords(results, expression.sort);
    }
    if (expression.page) {
      results = paginateRecords(results, expression.page as OffsetLimitPageSpecifier);
    }
    return results;
  },

  findRelatedRecords(cache: Cache, expression: FindRelatedRecords) {
    const { record, relationship } = expression;
    const { type, id } = record;
    const currentRecord = cache.records(type).get(id);
    const data = currentRecord && deepGet(currentRecord, ['relationships', relationship, 'data']);

    if (!data) { return []; }

    return (data as RecordIdentity[]).map(r => cache.records(r.type).get(r.id));
  },

  findRelatedRecord(cache: Cache, expression: FindRelatedRecord) {
    const { record, relationship } = expression;
    const { type, id } = record;
    const currentRecord = cache.records(type).get(id);
    const data = currentRecord && deepGet(currentRecord, ['relationships', relationship, 'data']);

    if (!data) { return null; }

    const r = data as RecordIdentity;
    return cache.records(r.type).get(r.id);
  }
};

function filterRecords(type: string, records: Record[], filters: FilterSpecifier[]) {
  const builtInFilters = filters.filter(f => f.kind !== 'custom');
  let results = records;
  if (builtInFilters.length > 0) {
    // apply built-in filters
    results = results.filter(record => {
      for (const filter of builtInFilters) {
        if (!applyFilter(record, filter)) {
          return false;
        }
      }
      return true;
    });
  }

  const prevFilters = builtInFilters;
  // apply custom filters
  for (const filter of filters) {
    if (filter.kind !== 'custom') {
      continue;
    }
    const customFilter = filter as CustomFilterSpecifier;
    results = applyCustomFilter(type, customFilter.name, results, customFilter.value, prevFilters);
    prevFilters.push(filter);
  }

  return results;
}

function applyFilter(record: Record, filter: FilterSpecifier) {
  if (filter.kind === 'attribute') {
    const attributeFilter = filter as AttributeFilterSpecifier;
    const actual = deepGet(record, ['attributes', attributeFilter.attribute]);
    const expected = attributeFilter.value;
    switch (filter.op) {
      case 'equal': return actual === expected;
      case 'gt':    return actual > expected;
      case 'gte':   return actual >= expected;
      case 'lt':    return actual < expected;
      case 'lte':   return actual <= expected;
      default:
        throw new QueryExpressionParseError(`Filter operation ${filter.op} not recognized for Store.`, filter);
    }
  } else if (filter.kind === 'relatedRecords') {
    const relatedRecordsFilter = filter as RelatedRecordsFilterSpecifier;
    const relation = deepGet(record, ['relationships', relatedRecordsFilter.relation]);
    const actual: RecordIdentity[] = relation === undefined ? [] : relation.data;
    const expected = relatedRecordsFilter.records;
    switch (filter.op) {
      case 'equal':
        return actual.length === expected.length
          && expected.every(e => actual.some(a => a.id === e.id && a.type === e.type));
      case 'all':
        return expected.every(e => actual.some(a => a.id === e.id && a.type === e.type));
      case 'some':
        return expected.some(e => actual.some(a => a.id === e.id && a.type === e.type));
      case 'none':
        return !expected.some(e => actual.some(a => a.id === e.id && a.type === e.type));
      default:
        throw new QueryExpressionParseError(`Filter operation ${filter.op} not recognized for Store.`, filter);
    }
  } else if (filter.kind === 'relatedRecord') {
    const relatedRecordFilter = filter as RelatedRecordFilterSpecifier;
    const relation = deepGet(record, ['relationships', relatedRecordFilter.relation]);
    const actual = relation === undefined ? undefined : relation.data;
    const expected = relatedRecordFilter.record;
    switch (filter.op) {
      case 'equal':
        if (Array.isArray(expected)) {
          return actual !== undefined && expected.some(e => actual.type === e.type && actual.id === e.id);
        } else {
          return actual !== undefined && actual.type === expected.type && actual.id === expected.id;
        }
      default:
        throw new QueryExpressionParseError(`Filter operation ${filter.op} not recognized for Store.`, filter);
    }
  }
  return false;
}

function sortRecords(records: Record[], sortSpecifiers: SortSpecifier[]) {
  const comparisonValues = new Map();

  records.forEach(record => {
    comparisonValues.set(
      record,
      sortSpecifiers.map(sortSpecifier => {
        if (sortSpecifier.kind === 'attribute') {
          return deepGet(record, ['attributes' , (<AttributeSortSpecifier>sortSpecifier).attribute]);
        } else {
          throw new QueryExpressionParseError(`Sort specifier ${sortSpecifier.kind} not recognized for Store.`,
            sortSpecifier);
        }
      })
    );
  });

  const comparisonOrders = sortSpecifiers.map(
    sortExpression => sortExpression.order === 'descending' ? -1 : 1);

  return records.sort((record1, record2) => {
    const values1 = comparisonValues.get(record1);
    const values2 = comparisonValues.get(record2);
    for (let i = 0; i < sortSpecifiers.length; i++) {
      if (values1[i] < values2[i]) {
        return -comparisonOrders[i];
      } else if (values1[i] > values2[i]) {
        return comparisonOrders[i];
      } else if (isNone(values1[i]) && !isNone(values2[i])) {
        return comparisonOrders[i];
      } else if (isNone(values2[i]) && !isNone(values1[i])) {
        return -comparisonOrders[i];
      }
    }
    return 0;
  });
}

function paginateRecords(records: Record[], paginationOptions: OffsetLimitPageSpecifier) {
  if (paginationOptions.limit !== undefined) {
    const offset = paginationOptions.offset === undefined ? 0 : paginationOptions.offset;
    const limit = paginationOptions.limit;

    return records.slice(offset, offset + limit);

  } else {
    throw new QueryExpressionParseError(
      'Pagination options not recognized for Store. Please specify `offset` and `limit`.', paginationOptions);
  }
}
