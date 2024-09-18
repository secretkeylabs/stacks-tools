import {
  error as safeError,
  success,
  type Result,
  type SafeError,
} from "./safe.js";
import { backOff } from "exponential-backoff";

type Options = {
  startingDelay?: number;
  numOfAttempts?: number;
};

const defaultStartingDelay = 15_000;
const defaultNumOfAttempts = 5;

export function callRateLimitedApi<T>(
  fn: () => Promise<T>,
  options?: Options,
): Promise<T> {
  return backOff(fn, {
    startingDelay: options?.startingDelay ?? defaultStartingDelay,
    numOfAttempts: options?.numOfAttempts ?? defaultNumOfAttempts,
  });
}

export async function safeCallRateLimitedApi<T>(
  fn: () => Promise<Result<T>>,
  options?: Options,
): Promise<Result<T, SafeError<"MaxRetriesExceeded" | string>>> {
  try {
    return await backOff(
      async () => {
        const [error, data] = await fn();
        if (error) {
          throw error;
        }

        return success(data);
      },
      {
        startingDelay: options?.startingDelay ?? 15_000,
        numOfAttempts: options?.numOfAttempts ?? 5,
      },
    );
  } catch (error) {
    return safeError({
      name: "MaxRetriesExceeded",
      message: "Failed to call rate limited API.",
      data: {
        error,
      },
    });
  }
}
