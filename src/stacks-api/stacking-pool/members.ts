import { error, safePromise, success, type Result } from "../../utils/safe.js";
import { type ApiRequestOptions } from "../types.js";
import * as v from "valibot";

export type Options = {
  poolPrincipal: string;
  afterBlock?: number;
  unanchored?: boolean;
  limit?: number;
  offset?: number;
};

export const memberSchema = v.object({
  stacker: v.string(),
  pox_addr: v.optional(v.string()),
  amount_ustx: v.string(),
  burn_block_unlock_height: v.optional(v.number()),
  block_height: v.number(),
  tx_id: v.string(),
});
export type Member = v.InferOutput<typeof memberSchema>;

export const membersResponseSchema = v.object({
  limit: v.number(),
  offset: v.number(),
  total: v.number(),
  results: v.array(memberSchema),
});
export type MembersResponse = v.InferOutput<typeof membersResponseSchema>;

export async function members(
  opts: Options,
  apiOpts: ApiRequestOptions,
): Promise<Result<MembersResponse>> {
  const search = new URLSearchParams();
  if (opts.afterBlock) search.append("after_block", opts.afterBlock.toString());
  if (opts.unanchored) search.append("unanchored", "true");
  if (opts.limit) search.append("limit", opts.limit.toString());
  if (opts.offset) search.append("offset", opts.offset.toString());

  const init: RequestInit = {};
  if (apiOpts.apiKeyConfig) {
    init.headers = {
      [apiOpts.apiKeyConfig.header]: apiOpts.apiKeyConfig.key,
    };
  }

  const res = await fetch(
    `${apiOpts.baseUrl}/extended/beta/stacking/${opts.poolPrincipal}/delegations?${search}`,
    init,
  );

  if (!res.ok) {
    return error({
      name: "FetchMembersError",
      message: "Failed to fetch members.",
      data: {
        status: res.status,
        statusText: res.statusText,
        bodyParseResult: await safePromise(res.json()),
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

  const validationResult = v.safeParse(membersResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
