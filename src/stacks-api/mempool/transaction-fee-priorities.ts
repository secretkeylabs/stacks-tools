import {
  error,
  safePromise,
  success,
  type Result,
  type SafeError,
} from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";

export type FeePrioritiesResponse = {
  all: {
    no_priority: number;
    low_priority: number;
    medium_priority: number;
    high_priority: number;
  };
  token_transfer: {
    no_priority: number;
    low_priority: number;
    medium_priority: number;
    high_priority: number;
  };
  smart_contract: {
    no_priority: number;
    low_priority: number;
    medium_priority: number;
    high_priority: number;
  };
  contract_call: {
    no_priority: number;
    low_priority: number;
    medium_priority: number;
    high_priority: number;
  };
};

export async function transactionFeePriorities(
  opts: ApiRequestOptions,
): Promise<
  Result<
    FeePrioritiesResponse,
    SafeError<
      "FetchFeePrioritiesError" | "ParseBodyError" | "ValidateDataError"
    >
  >
> {
  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }

  const endpoint = `${opts.baseUrl}/extended/v2/mempool/fees`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchFeePrioritiesError",
      message: "Failed to fetch transaction fee priorities.",
      data: {
        status: res.status,
        statusText: res.statusText,
        bodyParseResult: await safePromise(res.text()),
      },
    });
  }

  const [jsonError, data] = await safePromise(res.json());
  if (jsonError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body as JSON.",
      data: jsonError,
    });
  }

  return success(data as FeePrioritiesResponse);
}
