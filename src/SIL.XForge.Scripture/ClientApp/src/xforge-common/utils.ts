import { ClientError } from '@orbit/data';

export function nameof<T>(name: Extract<keyof T, string>): string {
  return name;
}

export function isNotFoundError(err: any): boolean {
  if (err instanceof ClientError) {
    const response: Response = (err as any).response;
    return response.status === 404;
  }
  return false;
}
