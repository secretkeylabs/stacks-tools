import { balances } from "./accounts/index.js";
export const accounts = { balances };
export type * as Accounts from "./accounts/index.js";

import { getBlock } from "./blocks/index.js";
export const blocks = { getBlock };
export type * as Blocks from "./blocks/index.js";

import { coreApi, poxDetails } from "./info/index.js";
export const info = { coreApi, poxDetails };
export type * as Info from "./info/index.js";

import {
  cycle,
  cycles,
  signerInCycle,
  signersInCycle,
  stackersForSignerInCycle,
} from "./proof-of-transfer/index.js";
export const proofOfTransfer = {
  cycle,
  cycles,
  signerInCycle,
  signersInCycle,
  stackersForSignerInCycle,
};
export type * as ProofOfTransfer from "./proof-of-transfer/index.js";

import { readOnly } from "./smart-contracts/index.js";
export const smartContracts = { readOnly };
export type * as SmartContracts from "./smart-contracts/index.js";

import { members } from "./stacking-pool/index.js";
export const stackingPool = { members };
export type * as StackingPool from "./stacking-pool/index.js";

import { addressTransactions, getTransaction } from "./transactions/index.js";
export const transactions = { addressTransactions, getTransaction };
export type * as Transactions from "./transactions/index.js";
