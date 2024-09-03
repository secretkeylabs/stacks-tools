import { signersInCycle } from "../stacks-api/proof-of-transfer/signers-in-cycle.js";
import type { ApiRequestOptions } from "../stacks-api/types.js";
import { safeCallRateLimitedApi } from "../utils/call-rate-limited-api.js";
import {
  error as safeError,
  success,
  type Result,
  type SafeError,
} from "../utils/safe.js";

export type Identifier =
  | {
      type: "address";
      signerAddress: string;
    }
  | {
      type: "publicKey";
      signerPublicKey: string;
    };

export type Args = { identifier: Identifier } & {
  cycleNumber: number;
} & ApiRequestOptions;

/**
 * Return the total locked amount for a signer in a PoX cycle.
 */
export async function getSignerStackedAmount(
  args: Args,
): Promise<Result<bigint, SafeError<"SignerNotFound" | string>>> {
  let totalLocked = 0n;

  const { identifier, ...rest } = args;

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
      if (identifier.type === "address") {
        if (signer.signer_address === identifier.signerAddress) {
          totalLocked = BigInt(signer.stacked_amount);
          found = true;
          break;
        }
      } else {
        if (signer.signing_key === identifier.signerPublicKey) {
          totalLocked = BigInt(signer.stacked_amount);
          found = true;
          break;
        }
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
        identifier,
        cycle: args.cycleNumber,
      },
    });
  }

  return success(totalLocked);
}
