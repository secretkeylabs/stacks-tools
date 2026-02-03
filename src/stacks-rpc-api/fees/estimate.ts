import * as v from "valibot";
import type { ApiRequestOptions } from "../../stacks-api/types.js";
import {
  error,
  safePromise,
  safeExtractResponseBody,
  success,
  type Result,
} from "../../utils/safe.js";

export type Args = {
  /**
   * A hex-encoded serialization of the TransactionPayload for the transaction.
   */
  transactionPayload: string;

  /**
   * An estimation of the final length (in bytes) of the transaction, including
   * any post-conditions and signatures
   */
  estimatedLength?: number;
} & ApiRequestOptions;

export const responseSchema = v.object({
  estimated_cost_scalar: v.number(),
  cost_scalar_change_by_byte: v.optional(v.number()),
  estimated_cost: v.object({
    read_count: v.number(),
    read_length: v.number(),
    runtime: v.number(),
    write_count: v.number(),
    write_length: v.number(),
  }),
  estimations: v.optional(
    v.array(
      v.object({
        fee_rate: v.optional(v.number()),
        fee: v.optional(v.number()),
      }),
    ),
  ),
});
export type Response = v.InferOutput<typeof responseSchema>;

export async function estimate(args: Args): Promise<Result<Response>> {
  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }
  init.method = "POST";
  init.body = JSON.stringify({
    transaction_payload: args.transactionPayload,
    ...(args.estimatedLength ? { estimated_len: args.estimatedLength } : {}),
  });
  init.headers = { ...init.headers, "Content-Type": "application/json" };

  const endpoint = `${args.baseUrl}/v2/fees/transaction`;
  const res = await fetch(endpoint, init);
  if (!res.ok) {
    return error({
      name: "FetchEstimateError",
      message: "Failed to fetch estimate.",
      data: {
        status: res.status,
        statusText: res.statusText,
        endpoint,
        body: await safeExtractResponseBody(res),
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
      message: "Failed to validate response data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
