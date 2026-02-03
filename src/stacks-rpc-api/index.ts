import { smartContracts } from "./smart-contracts/index.js";
export type * as SmartContracts from "./smart-contracts/index.js";

import { pox } from "./pox/index.js";
export type * as Pox from "./pox/index.js";

import { accounts } from "./accounts/index.js";
export type * as Accounts from "./accounts/index.js";

export const stacksRpcApi = {
  accounts,
  pox,
  smartContracts,
};
