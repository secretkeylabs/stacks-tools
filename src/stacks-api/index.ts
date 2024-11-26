import { accounts } from "./accounts/index.js";
export type * as Accounts from "./accounts/index.js";

import { blocks } from "./blocks/index.js";
export type * as Blocks from "./blocks/index.js";

import { faucets } from "./faucets/index.js";
export type * as Faucets from "./faucets/index.js";

import { info } from "./info/index.js";
export type * as Info from "./info/index.js";

import { proofOfTransfer } from "./proof-of-transfer/index.js";
export type * as ProofOfTransfer from "./proof-of-transfer/index.js";

import { stackingPool } from "./stacking-pool/index.js";
export type * as StackingPool from "./stacking-pool/index.js";

import { transactions } from "./transactions/index.js";
export type * as Transactions from "./transactions/index.js";

import { mempool } from "./mempool/index.js";
export type * as Mempool from "./mempool/index.js";

export const stacksApi = {
  accounts,
  blocks,
  faucets,
  info,
  mempool,
  proofOfTransfer,
  stackingPool,
  transactions,
};
