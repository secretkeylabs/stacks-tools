import * as v from "valibot";

export const baseTransactionSchema = v.object({
  tx_id: v.string(),
  nonce: v.number(),
  fee_rate: v.string(),
  sender_address: v.string(),
  sponsored: v.boolean(),
  post_condition_mode: v.string(),
  post_conditions: v.array(v.unknown()),
  anchor_mode: v.string(),
  is_unanchored: v.boolean(),
  block_hash: v.string(),
  parent_block_hash: v.string(),
  block_height: v.number(),
  block_time: v.number(),
  block_time_iso: v.string(),
  burn_block_height: v.number(),
  burn_block_time: v.number(),
  burn_block_time_iso: v.string(),
  parent_burn_block_time: v.number(),
  parent_burn_block_time_iso: v.string(),
  canonical: v.boolean(),
  tx_index: v.number(),
  tx_status: v.union([
    v.literal("success"),
    v.literal("abort_by_response"),
    v.literal("abort_by_post_condition"),
  ]),
  tx_result: v.object({
    hex: v.string(),
    repr: v.string(),
  }),
  microblock_hash: v.string(),
  microblock_sequence: v.number(),
  microblock_canonical: v.boolean(),
  event_count: v.number(),
  events: v.array(v.unknown()),
  execution_cost_read_count: v.number(),
  execution_cost_read_length: v.number(),
  execution_cost_runtime: v.number(),
  execution_cost_write_count: v.number(),
  execution_cost_write_length: v.number(),
});

export const contractCallTransactionSchema = v.object({
  tx_type: v.literal("contract_call"),
  contract_call: v.object({
    contract_id: v.string(),
    function_name: v.string(),
    function_signature: v.string(),
    function_args: v.array(
      v.object({
        hex: v.string(),
        repr: v.string(),
        name: v.string(),
        type: v.string(),
      }),
    ),
  }),
  ...baseTransactionSchema.entries,
});
export type ContractCallTransaction = v.InferOutput<
  typeof contractCallTransactionSchema
>;

export const smartContractTransactionSchema = v.object({
  tx_type: v.literal("smart_contract"),
  smart_contract: v.object({
    /**
     * NOTE: The types may be wrong, not sure what type of value is used when
     * the version is not `null`.
     */
    clarity_version: v.union([v.null(), v.number()]),
    contract_id: v.string(),
    source_code: v.string(),
  }),
  ...baseTransactionSchema.entries,
});
export type SmartContractTransaction = v.InferOutput<
  typeof smartContractTransactionSchema
>;

export const tokenTransferSchema = v.object({
  tx_type: v.literal("token_transfer"),
  token_transfer: v.object({
    recipient_address: v.string(),
    amount: v.string(),
    memo: v.string(),
  }),
  ...baseTransactionSchema.entries,
});

/**
 * Incomplete schema of some transaction types.
 */
export const transactionSchema = v.variant("tx_type", [
  contractCallTransactionSchema,
  smartContractTransactionSchema,
  tokenTransferSchema,
]);
export type Transaction = v.InferOutput<typeof transactionSchema>;
