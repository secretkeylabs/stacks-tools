import { error, safePromise, success, type Result } from "../../utils/safe.js";
import {
  baseListResponseSchema,
  type ApiPaginationOptions,
  type ApiRequestOptions,
} from "../types.js";
import * as v from "valibot";

export type Args = ApiRequestOptions & ApiPaginationOptions;

export const cycleInfoSchema = v.object({
  block_height: v.number(),
  index_block_hash: v.string(),
  cycle_number: v.number(),
  total_weight: v.number(),
  total_stacked_amount: v.string(),
  total_signers: v.number(),
});
export type CycleInfo = v.InferOutput<typeof cycleInfoSchema>;

export const resultsSchema = v.array(cycleInfoSchema);
export type Results = v.InferOutput<typeof resultsSchema>;

export const cyclesResponseSchema = v.object({
  ...baseListResponseSchema.entries,
  results: resultsSchema,
});
export type CyclesResponse = v.InferOutput<typeof cyclesResponseSchema>;

export async function cycles(args: Args): Promise<Result<CyclesResponse>> {
  const search = new URLSearchParams();
  if (args.limit) search.append("limit", args.limit.toString());
  if (args.offset) search.append("offset", args.offset.toString());

  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }
  const endpoint = `${args.baseUrl}/extended/v2/pox/cycles`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchCyclesError",
      message: "Failed to fetch cycles.",
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

  const validationResult = v.safeParse(cyclesResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate response data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
