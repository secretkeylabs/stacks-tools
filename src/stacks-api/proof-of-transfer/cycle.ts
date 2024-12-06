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
  cycleNumber: number;
} & ApiRequestOptions;

export const responseSchema = v.object({
  block_height: v.number(),
  index_block_hash: v.string(),
  cycle_number: v.number(),
  total_weight: v.number(),
  total_stacked_amount: v.string(),
  total_signers: v.number(),
});
export type Response = v.InferOutput<typeof responseSchema>;

export async function cycle(
  opts: Args,
): Promise<
  Result<
    Response,
    SafeError<"FetchCycleError" | "ParseBodyError" | "ValidateDataError">
  >
> {
  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }

  const endpoint = `${opts.baseUrl}/extended/v2/pox/cycles/${opts.cycleNumber}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchCycleError",
      message: "Failed to fetch cycle.",
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
