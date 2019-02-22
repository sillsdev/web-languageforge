import Orbit, {
  Query,
  Record,
  Transform,
  TransformNotAllowed,
  TransformOrOperations,
  Updatable,
  updatable
} from '@orbit/data';
import JSONAPISource from '@orbit/jsonapi';

import { QueryOperator, QueryOperators } from './query-operators';
import { getTransformRequests, TransformRequestProcessors, TransformRequestResponse } from './transform-requests';

@updatable
export class XForgeJSONAPISource extends JSONAPISource implements Updatable {
  update: (transformOrOperations: TransformOrOperations, options?: object, id?: string) => Promise<any>;

  constructor(settings = {}) {
    super(settings);
  }

  _push(transform: Transform): Promise<Transform[]> {
    const requests = getTransformRequests(this, transform);

    if (this.maxRequestsPerTransform && requests.length > this.maxRequestsPerTransform) {
      return Orbit.Promise.resolve().then(() => {
        throw new TransformNotAllowed(
          'This transform requires ' +
            requests.length +
            ' requests, which exceeds the specified limit of ' +
            this.maxRequestsPerTransform +
            ' requests per transform.',
          transform
        );
      });
    }

    const transforms: Transform[] = [];
    let result: Promise<void> = Orbit.Promise.resolve();

    requests.forEach(request => {
      result = result.then(() => {
        return this._processRequest(request).then(response => {
          Array.prototype.push.apply(transforms, response.transforms);
        });
      });
    });

    return result.then(() => {
      transforms.unshift(transform);
      return transforms;
    });
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
    return response.transforms;
  }

  async _query(query: Query): Promise<Record | Record[]> {
    const operator: QueryOperator = QueryOperators[query.expression.op];
    if (!operator) {
      throw new Error(`JSONAPISource does not support the \`${query.expression.op}\` operator for queries.`);
    }
    const response = await operator(this, query);
    query.options.included = response.includedData;
    if (response.meta != null) {
      query.options.totalPagedCount = response.meta['total-records'];
    }
    await this._transformed(response.transforms);
    return response.primaryData;
  }

  _update(transform: Transform): Promise<any> {
    const requests = getTransformRequests(this, transform);

    if (requests.length > 1) {
      return Orbit.Promise.resolve().then(() => {
        throw new TransformNotAllowed('This update requires more than one request.', transform);
      });
    }

    return this._processRequest(requests[0]).then(response => response.primaryData);
  }

  protected _processRequest(request: any): Promise<TransformRequestResponse> {
    const processor = TransformRequestProcessors[request.op];
    return processor(this, request);
  }
}
