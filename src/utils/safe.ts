import { backOff } from "exponential-backoff";

export type SafeError<TName extends string = string, TData = unknown> = {
  readonly name: TName;
  readonly message: string;
  readonly data?: TData;
};

type SuccessResult<Data = unknown> = [null, Data];
type ErrorResult<Error extends SafeError = SafeError> = [Error, null];
export type Result<Data = unknown, Error extends SafeError = SafeError> =
  | SuccessResult<Data>
  | ErrorResult<Error>;

export function success<Data>(data: Data): Result<Data, never> {
  return [null, data];
}

export function error<const E extends SafeError>(
  errorArg: E,
): Result<never, E> {
  return [errorArg, null];
}

export async function safePromise<T>(
  promise: Promise<T>,
): Promise<Result<T, SafeError<"SafeError">>> {
  try {
    return success(await promise);
  } catch (e) {
    return error({ name: "SafeError", message: "Promise rejected.", data: e });
  }
}

type Options = {
  startingDelay?: number;
  numOfAttempts?: number;
};

// 15s, 30s, 1min, 2min, 4min
const defaultStartingDelay = 15_000;
const defaultNumOfAttempts = 5;

export async function safeBackOff<T>(
  promise: Promise<Result<T>>,
  options?: Options,
): Promise<Result<T, SafeError<"BackoffError" | string>>> {
  const [backoffError, data] = await safePromise(
    backOff(
      async () => {
        const [error, data] = await promise;
        if (error) {
          throw error;
        }

        return data;
      },
      {
        startingDelay: options?.startingDelay ?? defaultStartingDelay,
        numOfAttempts: options?.numOfAttempts ?? defaultNumOfAttempts,
      },
    ),
  );

  if (backoffError) {
    return error({
      name: "BackoffError",
      message: "Retries exceeded.",
      data: backoffError.data,
    });
  }

  return success(data);
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

export function flatResults<T>(results: Array<Result<T>>): Result<Array<T>> {
  const errors = results
    .map((r) => r[0])
    .filter((maybeError): maybeError is SafeError => maybeError !== null);

  if (errors.length !== 0)
    return error({
      name: "FlatResultsError",
      message: `Found ${errors.length} errors in result array of length ${results.length}.`,
      data: errors.slice(0, 10), // Only show first 10 errors to avoid spamming logs
    });

  const values = results.map((r) => r[1] as T);

  return [null, values];
}

/**
 * Safely extracts response body by trying JSON first, then text, then undefined
 */
export async function safeExtractResponseBody(
  response: Response,
): Promise<unknown> {
  try {
    // Try JSON first
    return await response.json();
  } catch {
    try {
      // Fall back to text
      return await response.text();
    } catch {
      // If both fail, return undefined
      return undefined;
    }
  }
}
