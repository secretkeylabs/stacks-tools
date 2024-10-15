import { cycle } from "./cycle.js";
export type * as Cycle from "./cycle.js";

import { cycles } from "./cycles.js";
export type * as Cycles from "./cycles.js";

import { signerInCycle } from "./signer-in-cycle.js";
export type * as SignerInCycle from "./signer-in-cycle.js";

import { signersInCycle } from "./signers-in-cycle.js";
export type * as SignersInCycle from "./signers-in-cycle.js";

import { stackersForSignerInCycle } from "./stackers-for-signer-in-cycle.js";
export type * as StackersForSignerInCycle from "./stackers-for-signer-in-cycle.js";

export const proofOfTransfer = {
  cycle,
  cycles,
  signerInCycle,
  signersInCycle,
  stackersForSignerInCycle,
};
