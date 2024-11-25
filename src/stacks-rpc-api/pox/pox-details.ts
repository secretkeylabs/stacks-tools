import { error, safePromise, success, type Result } from "../../utils/safe.js";
import type { ApiRequestOptions } from "../../stacks-api/types.js";

type Args = ApiRequestOptions;

// This interface has been copied over from the documentation since it is not
// available as an export from existing libraries.
// https://github.com/hirosystems/docs/blob/main/content/docs/stacks/rpc-api/pox/pox-details.mdx
/**
 * Get Proof of Transfer (PoX) information
 */
export interface CoreNodePoxResponse {
  /**
   * The contract identifier for the PoX contract
   */
  contract_id: string;
  /**
   * The first burn block evaluated in this Stacks chain
   */
  first_burnchain_block_height: number;
  /**
   * The latest Bitcoin chain block height
   */
  current_burnchain_block_height: number;
  /**
   * The threshold of stacking participation that must be reached for PoX to
   * activate in any cycle
   */
  pox_activation_threshold_ustx: number;
  /**
   * The fraction of liquid STX that must vote to reject PoX in order to prevent
   * the next reward cycle from activating.
   */
  rejection_fraction: number;
  /**
   * The length in burn blocks of the reward phase
   */
  reward_phase_block_length: number;
  /**
   * The length in burn blocks of the prepare phase
   */
  prepare_phase_block_length: number;
  /**
   * The number of reward slots in a reward cycle
   */
  reward_slots: number;
  /**
   * The current total amount of liquid microstacks.
   */
  total_liquid_supply_ustx: number;
  /**
   * The length in burn blocks of a whole PoX cycle (reward phase and prepare
   * phase)
   */
  reward_cycle_length: number;
  current_cycle: {
    /**
     * The reward cycle number
     */
    id: number;
    /**
     * The threshold amount for obtaining a slot in this reward cycle.
     */
    min_threshold_ustx: number;
    /**
     * The total amount of stacked microstacks in this reward cycle.
     */
    stacked_ustx: number;
    /**
     * Whether or not PoX is active during this reward cycle.
     */
    is_pox_active: boolean;
  };
  next_cycle: {
    /**
     * The reward cycle number
     */
    id: number;
    /**
     * The threshold amount for obtaining a slot in this reward cycle.
     */
    min_threshold_ustx: number;
    /**
     * The total amount of stacked microstacks in this reward cycle.
     */
    stacked_ustx: number;
    /**
     * The minimum amount that can be used to submit a `stack-stx` call.
     */
    min_increment_ustx: number;
    /**
     * The burn block height when the prepare phase for this cycle begins. Any
     * eligible stacks must be stacked before this block.
     */
    prepare_phase_start_block_height: number;
    /**
     * The number of burn blocks until the prepare phase for this cycle starts.
     * If the prepare phase for this cycle already started, this value will be
     * negative.
     */
    blocks_until_prepare_phase: number;
    /**
     * The burn block height when the reward phase for this cycle begins. Any
     * eligible stacks must be stacked before this block.
     */
    reward_phase_start_block_height: number;
    /**
     * The number of burn blocks until this reward phase starts.
     */
    blocks_until_reward_phase: number;
    /**
     * The remaining amount of liquid STX that must vote to reject the next
     * reward cycle to prevent the next reward cycle from activating.
     */
    ustx_until_pox_rejection: number;
  };
  /**
   * @deprecated
   * The active reward cycle number
   */
  reward_cycle_id: number;
  /**
   * @deprecated
   */
  min_amount_ustx: number;
  /**
   * @deprecated
   */
  prepare_cycle_length: number;
  /**
   * @deprecated
   */
  rejection_votes_left_required: number;
  /**
   * Versions of each PoX
   */
  contract_versions: {
    /**
     * The contract identifier for the PoX contract
     */
    contract_id: string;
    /**
     * The burn block height at which this version of PoX is activated
     */
    activation_burnchain_block_height: number;
    /**
     * The first reward cycle number that uses this version of PoX
     */
    first_reward_cycle_id: number;
  }[];
}

export type PoxDetailsResponse = CoreNodePoxResponse;

export async function poxDetails(
  args: Args,
): Promise<Result<PoxDetailsResponse>> {
  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const res = await fetch(`${args.baseUrl}/v2/pox`, init);

  if (!res.ok) {
    return error({
      name: "FetchPoxDetailsError",
      message: "Failed to fetch pox details.",
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
      message: "Failed to parse pox details response.",
      data: jsonParseError,
    });
  }

  return success(data as PoxDetailsResponse);
}
