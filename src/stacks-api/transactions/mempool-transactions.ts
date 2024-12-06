import type { MempoolTransaction } from "@stacks/blockchain-api-client";
import {
  error,
  safePromise,
  success,
  type SafeError,
  type Result as SafeResult,
} from "../../utils/safe.js";
import {
  type ApiPaginationOptions,
  type ApiRequestOptions,
  type ListResponse,
} from "../types.js";

type Args = {
  /**
   * Filter to only return transactions with this sender address.
   */
  senderAddress?: string;

  /**
   * Filter to only return transactions with this recipient address (only
   * applicable for STX transfer tx types).
   */
  recipientAddress?: string;

  /**
   * Filter to only return transactions with this address as the sender or
   * recipient (recipient only applicable for STX transfer tx types).
   */
  address?: string;

  /**
   * Option to sort results by transaction age, size, or fee rate.
   */
  orderBy?: "age" | "size" | "fee";

  /**
   * Option to sort results in ascending or descending order.
   */
  order?: "asc" | "desc";
} & ApiRequestOptions &
  ApiPaginationOptions;

export type MempoolTransactionsResponse = ListResponse<MempoolTransaction>;

export async function mempoolTransactions(
  args: Args,
): Promise<
  SafeResult<
    MempoolTransactionsResponse,
    SafeError<
      "FetchMempoolTransactionsError" | "ParseBodyError" | "ValidateDataError"
    >
  >
> {
  const search = new URLSearchParams();
  if (args.limit) search.append("limit", args.limit.toString());
  if (args.offset) search.append("offset", args.offset.toString());
  if (args.senderAddress) search.append("sender_address", args.senderAddress);
  if (args.recipientAddress)
    search.append("recipient_address", args.recipientAddress);
  if (args.address) search.append("address", args.address);
  if (args.orderBy) search.append("order_by", args.orderBy);
  if (args.order) search.append("order", args.order);

  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const res = await fetch(
    `${args.baseUrl}/extended/v1/tx/mempool?${search}`,
    init,
  );

  if (!res.ok) {
    return error({
      name: "FetchMempoolTransactionsError",
      message: "Failed to fetch mempool transactions.",
      data: {
        status: res.status,
        statusText: res.statusText,
        bodyText: await safePromise(res.text()),
      },
    });
  }

  const [jsonParseError, data] = await safePromise(res.json());
  if (jsonParseError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body.",
      data: jsonParseError,
    });
  }

  return success(data as MempoolTransactionsResponse);
}
