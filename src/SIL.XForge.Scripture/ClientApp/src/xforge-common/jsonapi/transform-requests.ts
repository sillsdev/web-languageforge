import {
  AddRecordOperation,
  AddToRelatedRecordsOperation,
  buildTransform,
  cloneRecordIdentity,
  equalRecordIdentities,
  Record,
  recordDiffs,
  RecordIdentity,
  RecordOperation,
  RemoveFromRelatedRecordsOperation,
  RemoveRecordOperation,
  ReplaceAttributeOperation,
  ReplaceRecordOperation,
  ReplaceRelatedRecordOperation,
  ReplaceRelatedRecordsOperation,
  Transform
} from '@orbit/data';
import JSONAPISource, { JSONAPIDocument } from '@orbit/jsonapi';
import { clone, deepSet } from '@orbit/utils';

import { buildFetchSettings, customRequestOptions } from './request-settings';

export const TransformRequestProcessors = {
  addRecord(source: JSONAPISource, request, options) {
    const { serializer } = source;
    const record = request.record;
    const requestDoc: JSONAPIDocument = serializer.serializeDocument(record);
    const settings = buildFetchSettings(request.options, { method: 'POST', json: requestDoc });

    return source.fetch(source.resourceURL(record.type), settings)
      .then((raw: JSONAPIDocument) => handleChanges(record, serializer.deserializeDocument(raw, record), options));
  },

  removeRecord(source: JSONAPISource, request) {
    const { type, id } = request.record;
    const settings = buildFetchSettings(request.options, { method: 'DELETE' });

    return source.fetch(source.resourceURL(type, id), settings)
      .then(() => []);
  },

  replaceRecord(source: JSONAPISource, request, options) {
    const { serializer } = source;
    const record = request.record;
    const { type, id } = record;
    const requestDoc: JSONAPIDocument = serializer.serializeDocument(record);
    const settings = buildFetchSettings(request.options, { method: 'PATCH', json: requestDoc });

    return source.fetch(source.resourceURL(type, id), settings)
      .then((raw: JSONAPIDocument) => {
        if (raw) {
          return handleChanges(record, serializer.deserializeDocument(raw, record), options);
        } else {
          return [];
        }
      });
  },

  addToRelatedRecords(source: JSONAPISource, request) {
    const { type, id } = request.record;
    const { relationship } = request;
    const json = {
      data: request.relatedRecords.map(r => source.serializer.resourceIdentity(r))
    };
    const settings = buildFetchSettings(request.options, { method: 'POST', json });

    return source.fetch(source.resourceRelationshipURL(type, id, relationship), settings)
      .then(() => []);
  },

  removeFromRelatedRecords(source: JSONAPISource, request) {
    const { type, id } = request.record;
    const { relationship } = request;
    const json = {
      data: request.relatedRecords.map(r => source.serializer.resourceIdentity(r))
    };
    const settings = buildFetchSettings(request.options, { method: 'DELETE', json });

    return source.fetch(source.resourceRelationshipURL(type, id, relationship), settings)
      .then(() => []);
  },

  replaceRelatedRecord(source: JSONAPISource, request) {
    const { type, id } = request.record;
    const { relationship, relatedRecord } = request;
    const json = {
      data: relatedRecord ? source.serializer.resourceIdentity(relatedRecord) : null
    };
    const settings = buildFetchSettings(request.options, { method: 'PATCH', json });

    return source.fetch(source.resourceRelationshipURL(type, id, relationship), settings)
      .then(() => []);
  },

  replaceRelatedRecords(source: JSONAPISource, request) {
    const { type, id } = request.record;
    const { relationship, relatedRecords } = request;
    const json = {
      data: relatedRecords.map(r => source.serializer.resourceIdentity(r))
    };
    const settings = buildFetchSettings(request.options, { method: 'PATCH', json });

    return source.fetch(source.resourceRelationshipURL(type, id, relationship), settings)
      .then(() => []);
  }
};

const OperationToRequestMap = {
  addRecord(operation: AddRecordOperation) {
    return {
      op: 'addRecord',
      record: clone(operation.record)
    };
  },

  removeRecord(operation: RemoveRecordOperation) {
    return {
      op: 'removeRecord',
      record: cloneRecordIdentity(operation.record)
    };
  },

  replaceAttribute(operation: ReplaceAttributeOperation) {
    const record = cloneRecordIdentity(operation.record);

    replaceRecordAttribute(record, operation.attribute, operation.value);

    return {
      op: 'replaceRecord',
      record
    };
  },

  replaceRecord(operation: ReplaceRecordOperation) {
    return {
      op: 'replaceRecord',
      record: clone(operation.record)
    };
  },

  addToRelatedRecords(operation: AddToRelatedRecordsOperation) {
    return {
      op: 'addToRelatedRecords',
      record: cloneRecordIdentity(operation.record),
      relationship: operation.relationship,
      relatedRecords: [cloneRecordIdentity(operation.relatedRecord)]
    };
  },

  removeFromRelatedRecords(operation: RemoveFromRelatedRecordsOperation) {
    return {
      op: 'removeFromRelatedRecords',
      record: cloneRecordIdentity(operation.record),
      relationship: operation.relationship,
      relatedRecords: [cloneRecordIdentity(operation.relatedRecord)]
    };
  },

  replaceRelatedRecord(operation: ReplaceRelatedRecordOperation) {
    const record: Record = {
      type: operation.record.type,
      id: operation.record.id
    };

    deepSet(record, ['relationships', operation.relationship, 'data'], operation.relatedRecord);

    return {
      op: 'replaceRecord',
      record
    };
  },

  replaceRelatedRecords(operation: ReplaceRelatedRecordsOperation) {
    const record = cloneRecordIdentity(operation.record);
    deepSet(record, ['relationships', operation.relationship, 'data'], operation.relatedRecords);

    return {
      op: 'replaceRecord',
      record
    };
  }
};

export function getTransformRequests(source: JSONAPISource, transform: Transform) {
  const requests = [];
  let prevRequest;

  transform.operations.forEach((operation: RecordOperation) => {
    let request;
    let newRequestNeeded = true;

    if (prevRequest && equalRecordIdentities(prevRequest.record, operation.record)) {
      if (operation.op === 'removeRecord') {
        newRequestNeeded = false;

        if (prevRequest.op !== 'removeRecord') {
          prevRequest = null;
          requests.pop();
        }
      } else if (prevRequest.op === 'addRecord' || prevRequest.op === 'replaceRecord') {
        if (operation.op === 'replaceAttribute') {
          newRequestNeeded = false;
          replaceRecordAttribute(prevRequest.record, operation.attribute, operation.value);
        } else if (operation.op === 'replaceRelatedRecord') {
          newRequestNeeded = false;
          replaceRecordHasOne(prevRequest.record, operation.relationship, operation.relatedRecord);
        } else if (operation.op === 'replaceRelatedRecords') {
          newRequestNeeded = false;
          replaceRecordHasMany(prevRequest.record, operation.relationship, operation.relatedRecords);
        }
      } else if (prevRequest.op === 'addToRelatedRecords' &&
                 operation.op === 'addToRelatedRecords' &&
                 prevRequest.relationship === operation.relationship) {
        newRequestNeeded = false;
        prevRequest.relatedRecords.push(cloneRecordIdentity(operation.relatedRecord));
      }
    }

    if (newRequestNeeded) {
      request = OperationToRequestMap[operation.op](operation);
    }

    if (request) {
      const options = customRequestOptions(source, transform);
      if (options) {
        request.options = options;
      }
      requests.push(request);
      prevRequest = request;
    }
  });

  return requests;
}

function replaceRecordAttribute(record: RecordIdentity, attribute: string, value: any) {
  deepSet(record, ['attributes', attribute], value);
}

function replaceRecordHasOne(record: RecordIdentity, relationship: string, relatedRecord: RecordIdentity) {
  deepSet(record, ['relationships', relationship, 'data'], relatedRecord ? cloneRecordIdentity(relatedRecord) : null);
}

function replaceRecordHasMany(record: RecordIdentity, relationship: string, relatedRecords: RecordIdentity[]) {
  deepSet(record, ['relationships', relationship, 'data'], relatedRecords.map(r => cloneRecordIdentity(r)));
}

function handleChanges(record: Record, responseDoc, options) {
  const updatedRecord: Record = <Record>responseDoc.data;
  const transforms = [];
  const updateOps = recordDiffs(record, updatedRecord);
  if (updateOps.length > 0) {
    transforms.push(buildTransform(updateOps, options));
  }
  if (responseDoc.included && responseDoc.included.length > 0) {
    const includedOps = responseDoc.included.map(rec => {
      return { op: 'replaceRecord', rec };
    });
    transforms.push(buildTransform(includedOps, options));
  }
  return transforms;
}
