import {
  error,
  safePromise,
  safeExtractResponseBody,
  success,
  type Result,
} from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";

export type Args = {
  address: string;
  stacking?: boolean;
} & ApiRequestOptions;

export async function stx(opts: Args): Promise<Result<any>> {
  const search = new URLSearchParams();
  search.append("address", opts.address);
  if (opts.stacking) search.append("stacking", "true");

  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }
  init.method = "POST";

  const endpoint = `${opts.baseUrl}/extended/v1/faucets/stx?${search}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchStxError",
      message: "Failed to fetch STX.",
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
      message: "Failed to parse response body as JSON.",
      data: jsonError,
    });
  }

  return success(data);
}
