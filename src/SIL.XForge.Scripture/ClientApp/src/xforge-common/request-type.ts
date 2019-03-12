import { Query, Transform } from '@orbit/data';

export enum RequestType {
  LocalOnly = 'LocalOnly',
  OfflineFirst = 'OfflineFirst',
  OnlineOnly = 'OnlineOnly',
  OnlinePersist = 'OnlinePersist'
}

export function isOfflineRequest(queryOrTransform: Query | Transform): boolean {
  const requestType = getRequestType(queryOrTransform);
  return requestType === RequestType.OfflineFirst;
}

export function isOnlineRequest(queryOrTransform: Query | Transform): boolean {
  const requestType = getRequestType(queryOrTransform);
  return requestType === RequestType.OnlineOnly || requestType === RequestType.OnlinePersist;
}

export function isLocalRequest(queryOrTransform: Query | Transform): boolean {
  const requestType = getRequestType(queryOrTransform);
  return requestType === RequestType.LocalOnly;
}

export function isPersistRequest(queryOrTransform: Query | Transform): boolean {
  const requestType = getRequestType(queryOrTransform);
  return requestType !== RequestType.OnlineOnly;
}

export function getRequestType(queryOrTransform: Query | Transform): RequestType {
  return queryOrTransform.options.requestType;
}
