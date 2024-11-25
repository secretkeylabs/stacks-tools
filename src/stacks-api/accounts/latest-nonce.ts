import {
  error,
  safePromise,
  success,
  type Result,
  type SafeError,
} from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";
import * as v from "valibot";

export type Args = {
  principal: string;
} & ApiRequestOptions;

export const responseSchema = v.object({
  last_mempool_tx_nonce: v.nullable(v.number()),
  last_executed_tx_nonce: v.nullable(v.number()),
  possible_next_nonce: v.number(),
  detected_missing_nonces: v.array(v.number()),
  detected_mempool_nonces: v.array(v.number()),
});
export type Response = v.InferOutput<typeof responseSchema>;

export async function latestNonce(
  opts: Args,
): Promise<
  Result<
    Response,
    SafeError<"FetchLatestNonceError" | "ParseBodyError" | "ValidateDataError">
  >
> {
  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }

  const endpoint = `${opts.baseUrl}/extended/v1/address/${opts.principal}/nonces`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchLatestNonceError",
      message: "Failed to fetch latest nonce.",
      data: {
        endpoint,
        status: res.status,
        statusText: res.statusText,
        bodyText: await safePromise(res.text()),
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

  const validationResult = v.safeParse(responseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
