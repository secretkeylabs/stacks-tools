import { error, safePromise, success, type Result } from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";
import * as v from "valibot";

const CoreApiResponseSchema = v.object({
  peer_version: v.number(),
  pox_consensus: v.string(),
  burn_block_height: v.number(),
  stable_pox_consensus: v.string(),
  stable_burn_block_height: v.number(),
  server_version: v.string(),
  network_id: v.number(),
  parent_network_id: v.number(),
  stacks_tip_height: v.number(),
  stacks_tip: v.string(),
  stacks_tip_consensus_hash: v.string(),
  unanchored_tip: v.nullable(v.string()),
  unanchored_seq: v.nullable(v.string()),
  exit_at_block_height: v.nullable(v.number()),
});
export type CoreApiResponse = v.InferOutput<typeof CoreApiResponseSchema>;

export async function coreApi(
  apiOpts: ApiRequestOptions,
): Promise<Result<CoreApiResponse>> {
  const init: RequestInit = {};
  if (apiOpts.apiKeyConfig) {
    init.headers = {
      [apiOpts.apiKeyConfig.header]: apiOpts.apiKeyConfig.key,
    };
  }
  const res = await fetch(`${apiOpts.baseUrl}/v2/info`, init);

  if (!res.ok) {
    return error({
      name: "FetchCoreApiError",
      message: "Failed to fetch.",
      data: {
        status: res.status,
        statusText: res.statusText,
        bodyParseResult: await safePromise(res.json()),
      },
    });
  }

  const [parseBodyError, data] = await safePromise(res.json());
  if (parseBodyError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body as JSON.",
      data: parseBodyError,
    });
  }

  const validationResult = v.safeParse(CoreApiResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
