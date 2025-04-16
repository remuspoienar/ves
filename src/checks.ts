import type { Failure, Ok } from "./types";

export function isLooseValue<T>(val: T | null): val is T {
  return val !== null;
}

export function isErr<T>(err: Error | null): err is Error {
  return err !== null;
}

// more precise checking since it validates that a value and an error are mutually exclusive
export function isValue<T>(val: T | null, err: Error | null): val is T {
  return isLooseValue(val) && !isErr(err);
}

export function isOk<T>(result: Failure | Ok<T>): result is Ok<T> {
  const [val, err] = result;
  return isValue(val, err);
}
