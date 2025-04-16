export type Ok<T> = [value: T, err: null];
export type Failure = [value: null, err: Error];
export type Result<T> = Ok<T> | Failure;
