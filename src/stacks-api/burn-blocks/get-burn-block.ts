import type { OperationResponse } from "@stacks/blockchain-api-client";
import type { ApiRequestOptions } from "../types.js";
import {
  error,
  safeExtractResponseBody,
  safePromise,
  success,
  type Result,
} from "../../utils/safe.js";

export type Args = {
  heightOrHash: string | number | bigint;
} & ApiRequestOptions;

export type Response = OperationResponse["get_burn_block"];

export async function getBurnBlock(args: Args): Promise<Result<Response>> {
  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const endpoint = `${args.baseUrl}/extended/v2/burn-blocks/${args.heightOrHash}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "BurnBlockGetError",
      message: "Failed to get burn block.",
      data: {
        heightOrHash: args.heightOrHash,
        status: res.status,
        statusText: res.statusText,
        body: await safeExtractResponseBody(res),
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
