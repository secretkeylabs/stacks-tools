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
  unanchored?: boolean;
  untilBlock?: number;
} & ApiRequestOptions;

export const responseSchema = v.object({
  stx: v.object({
    balance: v.string(),
    total_sent: v.string(),
    total_received: v.string(),
    total_fees_sent: v.string(),
    total_miner_rewards_received: v.string(),
    lock_tx_id: v.string(),
    locked: v.string(),
    lock_height: v.number(),
    burnchain_lock_height: v.number(),
    burnchain_unlock_height: v.number(),
  }),
  fungible_tokens: v.record(
    v.string(),
    v.object({
      balance: v.string(),
      total_sent: v.string(),
      total_received: v.string(),
    }),
  ),
  non_fungible_tokens: v.record(
    v.string(),
    v.object({
      count: v.string(),
      total_sent: v.string(),
      total_received: v.string(),
    }),
  ),
});
export type Response = v.InferOutput<typeof responseSchema>;

export async function balances(
  opts: Args,
): Promise<
  Result<
    Response,
    SafeError<"FetchBalancesError" | "ParseBodyError" | "ValidateDataError">
  >
> {
  const search = new URLSearchParams();
  if (opts.unanchored) search.append("unanchored", "true");
  if (opts.untilBlock) search.append("until_block", opts.untilBlock.toString());

  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }

  const endpoint = `${opts.baseUrl}/extended/v1/address/${opts.principal}/balances?${search}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchBalancesError",
      message: "Failed to fetch balances.",
      data: {
        status: res.status,
        statusText: res.statusText,
        bodyParseResult: await safePromise(res.json()),
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
