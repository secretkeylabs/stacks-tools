import {
  error,
  safePromise,
  safeExtractResponseBody,
  success,
  type Result,
  type SafeError,
} from "../../utils/safe.js";
import { type ApiRequestOptions } from "../types.js";
import * as v from "valibot";

export type Args = {
  heightOrHash: string | number;
} & ApiRequestOptions;

export const responseSchema = v.object({
  canonical: v.boolean(),
  height: v.number(),
  hash: v.string(),
  block_time: v.number(),
  block_time_iso: v.string(),
  index_block_hash: v.string(),
  parent_block_hash: v.string(),
  parent_index_block_hash: v.string(),
  burn_block_time: v.number(),
  burn_block_time_iso: v.string(),
  burn_block_hash: v.string(),
  burn_block_height: v.number(),
  miner_txid: v.string(),
  tx_count: v.number(),
  execution_cost_read_count: v.number(),
  execution_cost_read_length: v.number(),
  execution_cost_runtime: v.number(),
  execution_cost_write_count: v.number(),
  execution_cost_write_length: v.number(),
});
export type Response = v.InferOutput<typeof responseSchema>;

export async function getBlock(
  opts: Args,
): Promise<
  Result<
    Response,
    SafeError<"FetchBlockError" | "ParseBodyError" | "ValidateDataError">
  >
> {
  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }

  const res = await fetch(
    `${opts.baseUrl}/extended/v2/blocks/${opts.heightOrHash}`,
    init,
  );

  if (!res.ok) {
    return error({
      name: "FetchBlockError",
      message: "Failed to fetch block.",
      data: {
        status: res.status,
        statusText: res.statusText,
        body: await safeExtractResponseBody(res),
      },
    });
  }

  const [jsonError, data] = await safePromise(res.json());
  if (jsonError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse body.",
      data: jsonError,
    });
  }

  const validationResult = v.safeParse(responseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
