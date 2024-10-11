import { error, safePromise, success, type Result } from "../../utils/safe.js";
import { type ApiPaginationOptions, type ApiRequestOptions } from "../types.js";
import * as v from "valibot";

export type Args = {
  poolPrincipal: string;
  afterBlock?: number;
  unanchored?: boolean;
  limit?: number;
  offset?: number;
} & ApiRequestOptions &
  ApiPaginationOptions;

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

export async function members(args: Args): Promise<Result<MembersResponse>> {
  const search = new URLSearchParams();
  if (args.afterBlock) search.append("after_block", args.afterBlock.toString());
  if (args.unanchored) search.append("unanchored", "true");
  if (args.limit) search.append("limit", args.limit.toString());
  if (args.offset) search.append("offset", args.offset.toString());

  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const endpoint = `${args.baseUrl}/extended/v1/pox4/${args.poolPrincipal}/delegations?${search}`;
  const res = await fetch(endpoint, init);

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
