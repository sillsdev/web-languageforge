import {
  AttributeFilterSpecifier,
  AttributeSortSpecifier,
  buildTransform,
  FilterSpecifier,
  FindRecord,
  FindRecords,
  FindRelatedRecord,
  FindRelatedRecords,
  OffsetLimitPageSpecifier,
  Operation,
  PageSpecifier,
  Query,
  QueryExpressionParseError,
  Record,
  RelatedRecordFilterSpecifier,
  RelatedRecordsFilterSpecifier,
  RemoveRecordOperation,
  ReplaceRelatedRecordOperation,
  ReplaceRelatedRecordsOperation,
  SortSpecifier,
  Transform
} from '@orbit/data';
import JSONAPISource, { JSONAPIDocument } from '@orbit/jsonapi';
import { Dict, merge, toArray } from '@orbit/utils';
import { isNotFoundError } from 'xforge-common/utils';
import { CustomFilterSpecifier } from '../custom-filter-specifier';
import { IndexedPageSpecifier } from '../indexed-page-specifier';
import { buildFetchSettings, customRequestOptions, Filter, RequestOptions } from './request-settings';

function operationsFromDeserializedDocument(deserialized: any): Operation[] {
  const records: Record[] = [];
  Array.prototype.push.apply(records, toArray(deserialized.data));

  if (deserialized.included) {
    Array.prototype.push.apply(records, deserialized.included);
  }

  return records.map(record => {
    return {
      op: 'replaceRecord',
      record
    };
  });
}

export interface QueryOperatorResponse {
  transforms: Transform[];
  primaryData: Record | Record[];
  meta?: any;
}

export type QueryOperator = (source: JSONAPISource, query: Query) => Promise<QueryOperatorResponse>;

export const QueryOperators: Dict<QueryOperator> = {
  async findRecord(source: JSONAPISource, query: Query): Promise<QueryOperatorResponse> {
    const expression = query.expression as FindRecord;
    const { record } = expression;
    const requestOptions = customRequestOptions(source, query);
    const settings = buildFetchSettings(requestOptions);

    try {
      const document: JSONAPIDocument = await source.fetch(source.resourceURL(record.type, record.id), settings);

      const deserialized = source.serializer.deserializeDocument(document);
      const operations = operationsFromDeserializedDocument(deserialized);

      const transforms = [buildTransform(operations)];
      const primaryData = deserialized.data;
      const meta = document.meta;

      return { transforms, primaryData, meta };
    } catch (err) {
      if (isNotFoundError(err)) {
        const removeOp: RemoveRecordOperation = { op: 'removeRecord', record };
        const transforms = [buildTransform(removeOp)];
        return { transforms, primaryData: null };
      }
      throw err;
    }
  },

  async findRecords(source: JSONAPISource, query: Query): Promise<QueryOperatorResponse> {
    const expression = query.expression as FindRecords;
    const { type } = expression;

    const requestOptions: RequestOptions = {};

    if (expression.filter) {
      requestOptions.filter = buildFilterParam(source, expression.filter);
    }

    if (expression.sort) {
      requestOptions.sort = buildSortParam(source, expression.sort);
    }

    if (expression.page) {
      requestOptions.page = buildPageParam(expression.page);
    }

    const customOptions = customRequestOptions(source, query);
    if (customOptions) {
      merge(requestOptions, customOptions);
    }

    const settings = buildFetchSettings(requestOptions);

    const document: JSONAPIDocument = await source.fetch(source.resourceURL(type), settings);

    const deserialized = source.serializer.deserializeDocument(document);
    const operations = operationsFromDeserializedDocument(deserialized);

    const transforms = [buildTransform(operations)];
    const primaryData = deserialized.data;
    const meta = document.meta;

    return { transforms, primaryData, meta };
  },

  async findRelatedRecord(source: JSONAPISource, query: Query): Promise<QueryOperatorResponse> {
    const expression = query.expression as FindRelatedRecord;
    const { record, relationship } = expression;
    const requestOptions = customRequestOptions(source, query);
    const settings = buildFetchSettings(requestOptions);

    try {
      const document: JSONAPIDocument = await source.fetch(
        source.relatedResourceURL(record.type, record.id, relationship),
        settings
      );

      const deserialized = source.serializer.deserializeDocument(document);
      const relatedRecord = deserialized.data as Record;
      const operations = operationsFromDeserializedDocument(deserialized);
      operations.push({
        op: 'replaceRelatedRecord',
        record,
        relationship,
        relatedRecord: relatedRecord == null ? null : { type: relatedRecord.type, id: relatedRecord.id }
      } as ReplaceRelatedRecordOperation);

      const transforms = [buildTransform(operations)];
      const primaryData = relatedRecord;
      const meta = document.meta;

      return { transforms, primaryData, meta };
    } catch (err) {
      if (isNotFoundError(err)) {
        const removeOp: RemoveRecordOperation = { op: 'removeRecord', record };
        const transforms = [buildTransform(removeOp)];
        return { transforms, primaryData: null };
      }
      throw err;
    }
  },

  async findRelatedRecords(source: JSONAPISource, query: Query): Promise<QueryOperatorResponse> {
    const expression = query.expression as FindRelatedRecords;
    const { record, relationship } = expression;
    const requestOptions = customRequestOptions(source, query);
    const settings = buildFetchSettings(requestOptions);

    try {
      const document: JSONAPIDocument = await source.fetch(
        source.relatedResourceURL(record.type, record.id, relationship),
        settings
      );

      const deserialized = source.serializer.deserializeDocument(document);
      const relatedRecords = deserialized.data as Record[];

      const operations = operationsFromDeserializedDocument(deserialized);
      operations.push({
        op: 'replaceRelatedRecords',
        record,
        relationship,
        relatedRecords: relatedRecords.map(r => ({ type: r.type, id: r.id }))
      } as ReplaceRelatedRecordsOperation);

      const transforms = [buildTransform(operations)];
      const primaryData = relatedRecords;
      const meta = document.meta;

      return { transforms, primaryData, meta };
    } catch (err) {
      if (isNotFoundError(err)) {
        const removeOp: RemoveRecordOperation = { op: 'removeRecord', record };
        const transforms = [buildTransform(removeOp)];
        return { transforms, primaryData: [] };
      }
      throw err;
    }
  }
};

function buildFilterParam(source: JSONAPISource, filterSpecifiers: FilterSpecifier[]): Filter[] {
  const filters: Filter[] = [];

  filterSpecifiers.forEach(filterSpecifier => {
    if (filterSpecifier.kind === 'attribute') {
      const attributeFilter = filterSpecifier as AttributeFilterSpecifier;

      // Note: We don't know the `type` of the attribute here, so passing `null`
      const resourceAttribute = source.serializer.resourceAttribute(null, attributeFilter.attribute);
      let prefix = '';
      switch (attributeFilter.op) {
        case 'equal':
          prefix = 'eq';
          break;
        case 'gt':
          prefix = 'gt';
          break;
        case 'lt':
          prefix = 'lt';
          break;
        case 'gte':
          prefix = 'ge';
          break;
        case 'lte':
          prefix = 'le';
          break;
      }
      filters.push({ [resourceAttribute]: prefix + ':' + attributeFilter.value });
    } else if (filterSpecifier.kind === 'relatedRecord') {
      const relatedRecordFilter = filterSpecifier as RelatedRecordFilterSpecifier;
      if (Array.isArray(relatedRecordFilter.record)) {
        filters.push({ [relatedRecordFilter.relation + '.id']: relatedRecordFilter.record.map(e => e.id).join(',') });
      } else {
        filters.push({ [relatedRecordFilter.relation + '.id']: relatedRecordFilter.record.id });
      }
    } else if (filterSpecifier.kind === 'relatedRecords') {
      if (filterSpecifier.op !== 'equal') {
        throw new Error(`Operation "${filterSpecifier.op}" is not supported in JSONAPI for relatedRecords filtering`);
      }
      const relatedRecordsFilter = filterSpecifier as RelatedRecordsFilterSpecifier;
      filters.push({ [relatedRecordsFilter.relation + '.id']: relatedRecordsFilter.records.map(e => e.id).join(',') });
    } else if (filterSpecifier.kind === 'custom') {
      const customFilter = filterSpecifier as CustomFilterSpecifier;

      const filterName = source.serializer.resourceAttribute(null, customFilter.name);
      filters.push({ [filterName]: customFilter.value });
    } else {
      throw new QueryExpressionParseError(
        `Filter operation ${filterSpecifier.op} not recognized for JSONAPISource.`,
        filterSpecifier
      );
    }
  });

  return filters;
}

function buildSortParam(source: JSONAPISource, sortSpecifiers: SortSpecifier[]) {
  return sortSpecifiers
    .map(sortSpecifier => {
      if (sortSpecifier.kind === 'attribute') {
        const attributeSort = sortSpecifier as AttributeSortSpecifier;

        // Note: We don't know the `type` of the attribute here, so passing `null`
        const resourceAttribute = source.serializer.resourceAttribute(null, attributeSort.attribute);
        return (sortSpecifier.order === 'descending' ? '-' : '') + resourceAttribute;
      }
      throw new QueryExpressionParseError(
        `Sort specifier ${sortSpecifier.kind} not recognized for JSONAPISource.`,
        sortSpecifier
      );
    })
    .join(',');
}

function buildPageParam(pageSpecifier: PageSpecifier): any {
  const param = {};
  switch (pageSpecifier.kind) {
    case 'offsetLimit':
      const offsetLimit = pageSpecifier as OffsetLimitPageSpecifier;
      param['offset'] = offsetLimit.offset;
      param['limit'] = offsetLimit.limit;
      break;
    case 'indexed':
      const indexed = pageSpecifier as IndexedPageSpecifier;
      param['number'] = indexed.index + 1;
      param['size'] = indexed.size;
      break;
  }
  return param;
}
