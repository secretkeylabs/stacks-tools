export type SafeError<TName extends string = string, TData = unknown> = {
  readonly name: TName;
  readonly message: string;
  readonly data?: TData;
};

export type Result<TData = unknown, E extends SafeError = SafeError> =
  | [E, null]
  | [null, TData];

export function success<D>(data: D): Result<D, never> {
  return [null, data];
}

export function error<const E extends SafeError>(error: E): Result<never, E> {
  return [error, null];
}

export async function safePromise<TData>(
  promise: Promise<TData>,
): Promise<Result<TData, SafeError<"SafePromiseError">>> {
  try {
    return success(await promise);
  } catch (e) {
    return error({
      name: "SafePromiseError",
      message: "Safe promise rejected.",
      data: e,
    });
  }
}

export function safeCall<Return>(
  fn: () => Return,
): Result<Return, SafeError<"SafeCallError">> {
  try {
    return success(fn());
  } catch (e) {
    return error({
      name: "SafeCallError",
      message: "Safe call failed.",
      data: e,
    });
  }
}
