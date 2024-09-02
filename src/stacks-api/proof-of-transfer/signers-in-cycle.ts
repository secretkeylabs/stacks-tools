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
} & ApiRequestOptions &
  ApiPaginationOptions;

export const signerSchema = v.object({
  signing_key: v.string(),
  signer_address: v.string(),
  weight: v.number(),
  stacked_amount: v.string(),
  weight_percent: v.number(),
  stacked_amount_percent: v.number(),
  pooled_stacker_count: v.number(),
  solo_stacker_count: v.number(),
});
export type Signer = v.InferOutput<typeof signerSchema>;

export const resultsSchema = v.array(signerSchema);
export type Results = v.InferOutput<typeof resultsSchema>;

export const signersResponseSchema = v.object({
  ...baseListResponseSchema.entries,
  results: resultsSchema,
});
export type SignersResponse = v.InferOutput<typeof signersResponseSchema>;

export async function signersInCycle(
  args: Args,
): Promise<
  Result<
    SignersResponse,
    SafeError<"FetchSignersError" | "ParseBodyError" | "ValidateDataError">
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
  const endpoint = `${args.baseUrl}/extended/v2/pox/cycles/${args.cycleNumber}/signers`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchSignersError",
      message: "Failed to fetch signers.",
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
      data: {
        endpoint,
        bodyParseResult: data,
      },
    });
  }

  const validationResult = v.safeParse(signersResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate response data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
