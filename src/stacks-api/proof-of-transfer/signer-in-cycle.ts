import { error, safePromise, success, type Result } from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";
import * as v from "valibot";

export type Args = {
  /**
   * The signers public key as a hex string, with or without a '0x' prefix.
   */
  signerPublicKey: string;
  cycleId: number;
} & ApiRequestOptions;

export const signerInCycleResponseSchema = v.object({
  signing_key: v.string(),
  signer_address: v.string(),
  weight: v.number(),
  stacked_amount: v.string(),
  weight_percent: v.number(),
  stacked_amount_percent: v.number(),
  solo_stacker_count: v.number(),
  pooled_stacker_count: v.number(),
});
export type SignerInCycleResponse = v.InferOutput<
  typeof signerInCycleResponseSchema
>;

export async function signerInCycle(
  args: Args,
): Promise<Result<SignerInCycleResponse>> {
  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }
  const signerPublicKey = args.signerPublicKey.startsWith("0x")
    ? args.signerPublicKey
    : `0x${args.signerPublicKey}`;
  const endpoint = `${args.baseUrl}/extended/v2/pox/cycles/${args.cycleId}/signers/${signerPublicKey}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchSignerInCycleError",
      message: "Failed to fetch signer in cycle.",
      data: {
        ...args,
        endpoint,
        status: res.status,
        statusText: res.statusText,
      },
    });
  }

  const [jsonError, data] = await safePromise(res.json());
  if (jsonError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body.",
      data: {
        signerPublicKey: args.signerPublicKey,
        cycleId: args.cycleId,
        jsonError,
      },
    });
  }

  const validationResult = v.safeParse(signerInCycleResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate response data.",
      data: validationResult.issues,
    });
  }

  return success(validationResult.output);
}
