import type { ApiRequestOptions } from "../stacks-api/types.js";
import { success, type Result } from "../utils/safe.js";

type Args = {
  burnHeight: number;
} & ApiRequestOptions;

export async function burnHeightToRewardCycle(
  _args: Args,
): Promise<Result<number>> {
  // TODO
  return success(0);
}
