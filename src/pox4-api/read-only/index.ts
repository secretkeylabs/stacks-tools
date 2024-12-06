import { getStackerInfo } from "./get-stacker-info.js";
export type * as GetStackerInfo from "./get-stacker-info.js";

import { getCheckDelegation } from "./get-check-delegation.js";
export type * as GetCheckDelegation from "./get-check-delegation.js";

export const readOnly = {
  getStackerInfo,
  getCheckDelegation,
};
