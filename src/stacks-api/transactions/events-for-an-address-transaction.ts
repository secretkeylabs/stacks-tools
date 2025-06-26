import type { OperationResponse } from "@stacks/blockchain-api-client";
import {
  success,
  error,
  safePromise,
  safeExtractResponseBody,
  type Result,
} from "../../utils/safe.js";
import type { ApiPaginationOptions, ApiRequestOptions } from "../types.js";

type Args = {
  address: string;
  transactionId: string;
} & ApiRequestOptions &
  ApiPaginationOptions;

type Response =
  OperationResponse["/extended/v2/addresses/{address}/transactions/{tx_id}/events"];

export async function eventsForAnAddressTransaction(
  args: Args,
): Promise<Result<Response>> {
  const search = new URLSearchParams();
  if (args.limit) search.append("limit", args.limit.toString());
  if (args.offset) search.append("offset", args.offset.toString());

  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const endpoint =
    `${args.baseUrl}/extended/v2` +
    `/addresses/${args.address}` +
    `/transactions/${args.transactionId}` +
    `/events` +
    `?${search}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchEventsForAnAddressTransactionError",
      message: `Failed to fetch address transaction events.`,
      data: {
        address: args.address,
        transactionId: args.transactionId,
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
      error: jsonParseError,
    });
  }

  return success(data as Response);
}
