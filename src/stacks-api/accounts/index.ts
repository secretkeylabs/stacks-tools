import { balances } from "./balances.js";
export type * as Balances from "./balances.js";

import { latestNonce } from "./latest-nonce.js";
export type * as LatestNonce from "./latest-nonce.js";

export const accounts = {
  balances,
  latestNonce,
};
