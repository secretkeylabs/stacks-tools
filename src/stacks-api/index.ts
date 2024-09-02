import { accounts } from "./accounts/index.js";
import { blocks } from "./blocks/index.js";
import { info } from "./info/index.js";
import { proofOfTransfer } from "./proof-of-transfer/index.js";
import { smartContracts } from "./smart-contracts/index.js";
import { stackingPool } from "./stacking-pool/index.js";
import { transactions } from "./transactions/index.js";

export const stacksApi = {
  accounts,
  blocks,
  info,
  proofOfTransfer,
  smartContracts,
  stackingPool,
  transactions,
};
