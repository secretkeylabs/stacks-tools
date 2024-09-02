import {
  error,
  safePromise,
  success,
  type Result,
  type SafeError,
} from "../../utils/safe.js";
import {
  baseListResponseSchema,
  type ApiPaginationOptions,
  type ApiRequestOptions,
} from "../types.js";
import * as v from "valibot";

export type Args = {
  cycleNumber: number;
  signerPublicKey: string;
} & ApiRequestOptions &
  ApiPaginationOptions;

export const stackerInfoSchema = v.object({
  stacker_address: v.string(),
  stacked_amount: v.string(),
  pox_address: v.string(),
  stacker_type: v.union([v.literal("pooled"), v.literal("solo")]),
});
export type StackerInfo = v.InferOutput<typeof stackerInfoSchema>;

export const resultsSchema = v.array(stackerInfoSchema);
export type Results = v.InferOutput<typeof resultsSchema>;

export const stackersForSignerInCycleResponseSchema = v.object({
  ...baseListResponseSchema.entries,
  results: resultsSchema,
});
export type StackersForSignerInCycleResponse = v.InferOutput<
  typeof stackersForSignerInCycleResponseSchema
>;

export async function stackersForSignerInCycle(
  opts: Args,
): Promise<
  Result<
    StackersForSignerInCycleResponse,
    SafeError<
      | "FetchStackersForSignerInCycleError"
      | "ParseBodyError"
      | "ValidateDataError"
    >
  >
> {
  const search = new URLSearchParams();
  if (opts.limit) search.append("limit", opts.limit.toString());
  if (opts.offset) search.append("offset", opts.offset.toString());

  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }

  const endpoint = `${opts.baseUrl}/extended/v2/pox/cycles/${opts.cycleNumber}/signers/${opts.signerPublicKey}/stackers?${search}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchStackersForSignerInCycleError",
      message: "Failed to fetch stackers for signer in cycle.",
      data: {
        endpoint,
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

  const validationResult = v.safeParse(
    stackersForSignerInCycleResponseSchema,
    data,
  );
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate response data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
