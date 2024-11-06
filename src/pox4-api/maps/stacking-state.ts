import {
  cvToHex,
  hexToCV,
  type BufferCV,
  type ListCV,
  type OptionalCV,
  type PrincipalCV,
  type TupleCV,
  type UIntCV,
} from "@stacks/transactions";
import type { ApiRequestOptions, ProofAndTip } from "../../stacks-api/types.js";
import { mapEntry } from "../../stacks-rpc-api/smart-contracts/map-entry.js";
import { networkDependentValues, type Network } from "../constants.js";
import { error, success, type Result } from "../../utils/safe.js";

export type StackingStateKey = TupleCV<{ stacker: PrincipalCV }>;
export type StackingStateValue = TupleCV<{
  "pox-addr": TupleCV<{ version: BufferCV; hashbytes: BufferCV }>;
  "lock-period": UIntCV;
  "first-reward-cycle": UIntCV;
  "reward-set-indexes": ListCV<UIntCV>;
  "delegated-to": OptionalCV<PrincipalCV>;
}>;

export type Args = {
  key: StackingStateKey;
  network: Network;
} & ApiRequestOptions &
  ProofAndTip;

export async function stackingState({
  key,
  network,
  baseUrl,
  apiKeyConfig,
  proof,
  tip,
}: Args): Promise<Result<{ data: StackingStateValue; proof?: string }>> {
  const [mapEntryError, mapEntryData] = await mapEntry({
    contractAddress: networkDependentValues(network).pox4ContractAddress,
    contractName: networkDependentValues(network).pox4ContractName,
    mapKey: cvToHex(key),
    mapName: "stacking-state",
    apiKeyConfig,
    proof,
    tip,
    baseUrl,
  });

  if (mapEntryError)
    return error({
      name: "FetchStackingStateError",
      message: "Failed to fetch stacking state.",
      data: mapEntryError,
    });

  return success({
    data: hexToCV(mapEntryData.data) as StackingStateValue,
    proof: mapEntryData.proof,
  });
}
