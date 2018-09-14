import { Operation, Query, QueryBuilder, QueryExpression, QueryTerm, Transform, TransformBuilder } from '@orbit/data';

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module '@orbit/data' {
  export type QueryBuilderFunc = (b: QueryBuilder) => QueryOrExpression;
  export type QueryOrExpression = Query | QueryExpression | QueryTerm | QueryBuilderFunc;
  export function buildQuery(queryOrExpression: QueryOrExpression, queryOptions?: object, queryId?: string,
    queryBuilder?: QueryBuilder): Query;

  export type TransformBuilderFunc = (b: TransformBuilder) => TransformOrOperations;
  export type TransformOrOperations = Transform | Operation | Operation[] | TransformBuilderFunc
}
