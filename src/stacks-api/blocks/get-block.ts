import type { OperationResponse } from "@stacks/blockchain-api-client";
import {
  error,
  safePromise,
  safeExtractResponseBody,
  success,
  type Result,
} from "../../utils/safe.js";
import { type ApiRequestOptions } from "../types.js";

export type Args = {
  heightOrHash: string | number;
} & ApiRequestOptions;

export type Response = OperationResponse["get_block"];

export async function getBlock(opts: Args): Promise<Result<Response>> {
  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }

  const endpoint = `${opts.baseUrl}/extended/v2/blocks/${opts.heightOrHash}`;

  const res = await fetch(endpoint, init);

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

  return success(data as Response);
}
