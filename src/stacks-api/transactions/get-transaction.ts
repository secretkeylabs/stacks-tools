import type { OperationResponse } from "@stacks/blockchain-api-client";
import {
  success,
  error,
  safePromise,
  safeExtractResponseBody,
  type Result,
} from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";

type Args = {
  transactionId: string;
} & ApiRequestOptions;

type Response = OperationResponse["get_transaction_by_id"];

export async function getTransaction(args: Args): Promise<Result<Response>> {
  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const endpoint = `${args.baseUrl}/extended/v1/tx/${args.transactionId}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchTransactionError",
      message: `Failed to fetch transaction.`,
      data: {
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
