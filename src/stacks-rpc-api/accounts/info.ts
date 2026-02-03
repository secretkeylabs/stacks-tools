import type { ApiRequestOptions, ProofAndTip } from "../../stacks-api/types.js";
import {
  error,
  safeExtractResponseBody,
  safePromise,
  success,
} from "../../utils/safe.js";

export type Args = {
  /** Stacks principal. */
  principal: string;
} & ApiRequestOptions &
  ProofAndTip;

export type InfoResponse = {
  /** Micro-STX as a hex-encoded string. */
  balance: string;
  /** Micro-STX as a hex-encoded string. */
  locked: string;
  unlock_height: number;
  nonce: number;
  balance_proof: string;
  nonce_proof: string;
};

export type InfoReturn = Promise<InfoResponse>;

export const info = async (args: Args) => {
  const search = new URLSearchParams();
  if (args.proof === 0) search.append("proof", "0");
  if (args.tip) search.append("tip", args.tip);

  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }
  init.method = "GET";

  const endpoint = `${args.baseUrl}/v2/accounts/${args.principal}?${search}`;

  const res = await fetch(endpoint, init);
  if (!res.ok)
    return error({
      name: "InfoFetchError",
      message: "Failed to fetch info.",
      data: {
        init,
        status: res.status,
        statusText: res.statusText,
        endpoint,
        body: await safeExtractResponseBody(res),
      },
    });

  const [jsonError, data] = await safePromise(res.json());
  if (jsonError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body as JSON.",
      data: jsonError,
    });
  }

  return success(data);
};
