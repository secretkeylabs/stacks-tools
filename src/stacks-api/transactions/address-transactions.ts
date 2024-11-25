import {
  error,
  safePromise,
  success,
  type SafeError,
  type Result as SafeResult,
} from "../../utils/safe.js";
import {
  baseListResponseSchema,
  type ApiPaginationOptions,
  type ApiRequestOptions,
} from "../types.js";
import { transactionSchema } from "./schemas.js";
import * as v from "valibot";

type Args = {
  address: string;
} & ApiRequestOptions &
  ApiPaginationOptions;

// May be a good idea to move this to a shared location
const resultSchema = v.object({
  tx: transactionSchema,
  stx_sent: v.string(),
  stx_received: v.string(),
  events: v.object({
    stx: v.object({
      transfer: v.number(),
      mint: v.number(),
      burn: v.number(),
    }),
    ft: v.object({
      transfer: v.number(),
      mint: v.number(),
      burn: v.number(),
    }),
    nft: v.object({
      transfer: v.number(),
      mint: v.number(),
      burn: v.number(),
    }),
  }),
});
export type Result = v.InferOutput<typeof resultSchema>;

const resultsSchema = v.array(resultSchema);
export type Results = v.InferOutput<typeof resultsSchema>;

const addressTransactionsResponseSchema = v.object({
  ...baseListResponseSchema.entries,
  results: resultsSchema,
});
export type AddressTransactionsResponse = v.InferOutput<
  typeof addressTransactionsResponseSchema
>;

export async function addressTransactions(
  args: Args,
): Promise<
  SafeResult<
    AddressTransactionsResponse,
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
        bodyText: await safePromise(res.text()),
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

  const validationResult = v.safeParse(addressTransactionsResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
