import type { OperationResponse } from "@stacks/blockchain-api-client";
import {
  error,
  safePromise,
  safeExtractResponseBody,
  success,
  type Result,
  type SafeError,
} from "../../utils/safe.js";
import { type ApiPaginationOptions, type ApiRequestOptions } from "../types.js";

export type Args = {
  cycleNumber: string | number | bigint;
  signerPublicKey: string;
} & ApiRequestOptions &
  ApiPaginationOptions;

export type Response = OperationResponse["get_pox_cycle_signer_stackers"];

export async function stackersForSignerInCycle(
  opts: Args,
): Promise<
  Result<
    Response,
    SafeError<"FetchStackersForSignerInCycleError" | "ParseBodyError">
  >
> {
  const search = new URLSearchParams();
  if (opts.limit) search.append("limit", opts.limit.toString());
  if (opts.offset) search.append("offset", opts.offset.toString());

  const init: RequestInit = {};
  if (opts.apiKeyConfig) {
    init.headers = {
      [opts.apiKeyConfig.header]: opts.apiKeyConfig.key,
    };
  }

  const signerPublicKeyPathParam = opts.signerPublicKey.startsWith("0x")
    ? opts.signerPublicKey
    : `0x${opts.signerPublicKey}`;
  const endpoint = `${opts.baseUrl}/extended/v2/pox/cycles/${opts.cycleNumber}/signers/${signerPublicKeyPathParam}/stackers?${search}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchStackersForSignerInCycleError",
      message: "Failed to fetch stackers for signer in cycle.",
      data: {
        endpoint,
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

  return success(data as Response);
}
