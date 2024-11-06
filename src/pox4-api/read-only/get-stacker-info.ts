import {
  cvToHex,
  hexToCV,
  principalCV,
  type BufferCV,
  type ListCV,
  type OptionalCV,
  type PrincipalCV,
  type TupleCV,
  type UIntCV,
} from "@stacks/transactions";
import { stacksRpcApi } from "../../stacks-rpc-api/index.js";
import { networkDependentValues, type Network } from "../constants.js";
import type { ApiRequestOptions } from "../../stacks-api/types.js";
import { error, success } from "../../utils/safe.js";

export type Args = {
  principal: string;
  network: Network;
} & ApiRequestOptions;

type GetStackerInfoReturn = OptionalCV<
  TupleCV<{
    "pox-addr": TupleCV<{ version: BufferCV; hashbytes: BufferCV }>;
    "lock-period": UIntCV;
    "first-reward-cycle": UIntCV;
    "reward-set-indexes": ListCV<UIntCV>;
    "delegated-to": OptionalCV<PrincipalCV>;
  }>
>;

export async function getStackerInfo({
  principal,
  network,
  baseUrl,
  apiKeyConfig,
}: Args) {
  const [readOnlyError, readOnlyData] =
    await stacksRpcApi.smartContracts.readOnly({
      contractAddress: networkDependentValues(network).pox4ContractAddress,
      contractName: networkDependentValues(network).pox4ContractName,
      functionName: "get-stacker-info",
      arguments: [cvToHex(principalCV(principal))],
      baseUrl,
      apiKeyConfig,
      sender: principal,
    });

  if (readOnlyError) {
    return error({
      name: "GetStackerInfoError",
      message: "Failed to get stacker info.",
      data: readOnlyError,
    });
  }

  if (!readOnlyData.okay) {
    return error({
      name: "GetStackerInfoFunctionCallError",
      message: "Call to `get-stacker-info` failed.",
      data: readOnlyData,
    });
  }

  return success(hexToCV(readOnlyData.result) as GetStackerInfoReturn);
}
