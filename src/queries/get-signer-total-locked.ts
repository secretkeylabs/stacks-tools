import { signersInCycle } from "../stacks-api/proof-of-transfer/signers-in-cycle.js";
import type { ApiRequestOptions } from "../stacks-api/types.js";
import { safeCallRateLimitedApi } from "../utils/call-rate-limited-api.js";
import {
  error as safeError,
  success,
  type Result,
  type SafeError,
} from "../utils/safe.js";

export type Args = {
  cycleNumber: number;
  signerAddress: string;
} & ApiRequestOptions;

/**
 * Return the total locked amount for a signer in a PoX cycle.
 */
export async function getSignerTotalLocked(
  args: Args,
): Promise<Result<bigint, SafeError<"SignerNotFound" | string>>> {
  let totalLocked = 0n;

  const { signerAddress, ...rest } = args;

  let hasMore = true;
  let offset = 0;
  let found = false;
  const limit = 200;
  while (hasMore && !found) {
    const [error, data] = await safeCallRateLimitedApi(() =>
      signersInCycle({
        ...rest,
        limit,
      }),
    );

    if (error) {
      return safeError({
        name: "GetSignerTotalLockedError",
        message: "Failed to get signer total locked.",
        data: {
          error,
        },
      });
    }

    for (const signer of data.results) {
      if (signer.signer_address === signerAddress) {
        totalLocked = BigInt(signer.stacked_amount);
        found = true;
        break;
      }
    }

    offset += limit + data.results.length;
    hasMore = offset < data.total;
  }

  if (!found) {
    return safeError({
      name: "SignerNotFound",
      message: "Signer not found.",
      data: {
        signerAddress,
      },
    });
  }

  return success(totalLocked);
}
