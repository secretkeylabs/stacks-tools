import { error, safePromise, success, type Result } from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";
import * as v from "valibot";

type Args = ApiRequestOptions;

const poxDetailsResponseSchema = v.object({
  contract_id: v.string(),
  pox_activation_threshold_ustx: v.number(),
  first_burnchain_block_height: v.number(),
  current_burnchain_block_height: v.number(),
  prepare_phase_block_length: v.number(),
  reward_phase_block_length: v.number(),
  reward_slots: v.number(),
  rejection_fraction: v.null(),
  total_liquid_supply_ustx: v.number(),
  current_cycle: v.object({
    id: v.number(),
    min_threshold_ustx: v.number(),
    stacked_ustx: v.number(),
    is_pox_active: v.boolean(),
  }),
  next_cycle: v.object({
    id: v.number(),
    min_threshold_ustx: v.number(),
    min_increment_ustx: v.number(),
    stacked_ustx: v.number(),
    prepare_phase_start_block_height: v.number(),
    blocks_until_prepare_phase: v.number(),
    reward_phase_start_block_height: v.number(),
    blocks_until_reward_phase: v.number(),
    ustx_until_pox_rejection: v.null(),
  }),
  epochs: v.array(
    v.object({
      epoch_id: v.string(),
      start_height: v.number(),
      end_height: v.number(),
      block_limit: v.object({
        write_length: v.number(),
        write_count: v.number(),
        read_length: v.number(),
        read_count: v.number(),
        runtime: v.number(),
      }),
      network_epoch: v.number(),
    }),
  ),
  min_amount_ustx: v.number(),
  prepare_cycle_length: v.number(),
  reward_cycle_id: v.number(),
  reward_cycle_length: v.number(),
  rejection_votes_left_required: v.null(),
  next_reward_cycle_in: v.number(),
  contract_versions: v.array(
    v.object({
      contract_id: v.string(),
      activation_burnchain_block_height: v.number(),
      first_reward_cycle_id: v.number(),
    }),
  ),
});
type PoxDetailsResponse = v.InferOutput<typeof poxDetailsResponseSchema>;

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
        bodyParseResult: await safePromise(res.json()),
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

  const validationResult = v.safeParse(poxDetailsResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to parse pox details response.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
