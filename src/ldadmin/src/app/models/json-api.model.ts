export interface JsonResult<T> {
  ok: boolean;
  data: T;
  message: string;
}

export interface JsonError {
  message: string;
}
