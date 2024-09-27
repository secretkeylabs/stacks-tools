import {
  accounts,
  blocks,
  info,
  proofOfTransfer,
  smartContracts,
  stackingPool,
  transactions,
} from "./stacks-api/index.js";
export const stacksApi = {
  accounts,
  blocks,
  info,
  proofOfTransfer,
  smartContracts,
  stackingPool,
  transactions,
};
export type * as StacksApi from "./stacks-api/index.js";

export * from "./utils/index.js";
