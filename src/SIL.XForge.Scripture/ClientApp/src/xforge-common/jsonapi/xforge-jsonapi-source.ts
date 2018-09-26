import Orbit, { Query, Transform, TransformNotAllowed } from '@orbit/data';
import JSONAPISource from '@orbit/jsonapi';

import { PullOperator, PullOperators } from './pull-operators';
import { getTransformRequests, TransformRequestProcessors } from './transform-requests';

export class XForgeJSONAPISource extends JSONAPISource {
  constructor(settings = {}) {
    super(settings);
  }

  _push(transform: Transform): Promise<Transform[]> {
    const requests = getTransformRequests(this, transform);

    if (this.maxRequestsPerTransform && requests.length > this.maxRequestsPerTransform) {
      return Orbit.Promise.resolve()
        .then(() => {
          throw new TransformNotAllowed('This transform requires ' + requests.length
              + ' requests, which exceeds the specified limit of ' + this.maxRequestsPerTransform
              + ' requests per transform.',
            transform);
        });
    }

    return this._processRequestsWithOptions(requests, TransformRequestProcessors, transform.options)
      .then(transforms => {
        transforms.unshift(transform);
        return transforms;
      });
  }

  _pull(query: Query): Promise<Transform[]> {
    const operator: PullOperator = PullOperators[query.expression.op];
    if (!operator) {
      throw new Error('JSONAPISource does not support the ' + query.expression.op + ' operator for queries.');
    }
    return operator(this, query);
  }

  protected _processRequestsWithOptions(requests, processors, options): Promise<Transform[]> {
    const transforms: Transform[] = [];
    let result: Promise<void> = Orbit.Promise.resolve();

    requests.forEach(request => {
      const processor = processors[request.op];

      result = result.then(() => {
        return processor(this, request, options)
          .then(additionalTransforms => {
            if (additionalTransforms) {
              Array.prototype.push.apply(transforms, additionalTransforms);
            }
          });
      });
    });

    return result.then(() => transforms);
  }
}
