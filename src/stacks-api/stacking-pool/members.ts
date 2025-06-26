import type { OperationResponse } from "@stacks/blockchain-api-client";
import { error, safePromise, success, type Result } from "../../utils/safe.js";
import { type ApiPaginationOptions, type ApiRequestOptions } from "../types.js";

export type Args = {
  poolPrincipal: string;
  afterBlock?: string | number | bigint;
  unanchored?: boolean;
  limit?: number;
  offset?: number;
} & ApiRequestOptions &
  ApiPaginationOptions;

export type Response = OperationResponse["get_pool_delegations"];

export async function members(args: Args): Promise<Result<Response>> {
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

  return success(data as Response);
}
