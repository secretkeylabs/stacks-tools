import {
  error,
  safePromise,
  safeExtractResponseBody,
  success,
  type SafeError,
  type Result as SafeResult,
} from "../../utils/safe.js";
import { type ApiPaginationOptions, type ApiRequestOptions } from "../types.js";
import type { OperationResponse } from "@stacks/blockchain-api-client";

type Args = {
  address: string;
} & ApiRequestOptions &
  ApiPaginationOptions;

export type Result =
  OperationResponse["/extended/v2/addresses/{address}/transactions"];

export async function addressTransactions(
  args: Args,
): Promise<
  SafeResult<
    Result,
    SafeError<
      "FetchAddressTransactionsError" | "ParseBodyError" | "ValidateDataError"
    >
  >
> {
  const search = new URLSearchParams();
  if (args.limit) search.append("limit", args.limit.toString());
  if (args.offset) search.append("offset", args.offset.toString());

  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const res = await fetch(
    `${args.baseUrl}/extended/v2/addresses/${args.address}/transactions?${search}`,
    init,
  );

  if (!res.ok) {
    return error({
      name: "FetchAddressTransactionsError",
      message: "Failed to fetch address transactions.",
      data: {
        status: res.status,
        statusText: res.statusText,
        body: await safeExtractResponseBody(res),
      },
    });
  }

  const [jsonParseError, data] = await safePromise(res.json());
  if (jsonParseError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body as JSON.",
      data: jsonParseError,
    });
  }

  return success(data as Result);
}
