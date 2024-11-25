import type { OperationResponse } from "@stacks/blockchain-api-client";
import {
  error,
  safePromise,
  success,
  type Result,
  type SafeError,
} from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";

export type Args = {
  principal: string;
  unanchored?: boolean;
  untilBlock?: number;
} & ApiRequestOptions;

export async function balances(
  opts: Args,
): Promise<
  Result<
    OperationResponse["get_account_balance"],
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

  return success(data as OperationResponse["get_account_balance"]);
}
