import type { Failure, Ok } from "./types";

export function ves<T, A extends Array<any>>(
  fn: (...args: A) => T | Promise<T>
) {
  return async (...args: A) => {
    try {
      const result = await fn(...args);
      return [result, null] as Ok<T>;
    } catch (e) {
      return [null, e as Error] as Failure;
    }
  };
}

export async function useVes<T>(fn: () => Promise<T>) {
  try {
    const result = await fn();
    return [result, null] as Ok<T>;
  } catch (e) {
    return [null, e as Error] as Failure;
  }
}
