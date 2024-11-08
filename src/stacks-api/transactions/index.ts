import { addressTransactions } from "./address-transactions.js";
export type * as AddressTransactions from "./address-transactions.js";

import { getTransaction } from "./get-transaction.js";
export type * as GetTransaction from "./get-transaction.js";

import { mempoolTransactions } from "./mempool-transactions.js";
export type * as MempoolTransactions from "./mempool-transactions.js";

export type * as Common from "./schemas.js";

export const transactions = {
  addressTransactions,
  getTransaction,
  mempoolTransactions,
};
