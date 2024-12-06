import { mapEntry } from "./map-entry.js";
export type * as MapEntry from "./map-entry.js";
import { readOnly } from "./read-only.js";
export type * as ReadOnly from "./read-only.js";
import { contractInterface } from "./interface.js";
export type * as ContractInterface from "./interface.js";

export const smartContracts = {
  contractInterface,
  mapEntry,
  readOnly,
};
