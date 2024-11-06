import {
  cvToHex,
  hexToCV,
  principalCV,
  type OptionalCV,
  type PrincipalCV,
  type TupleCV,
  type UIntCV,
} from "@stacks/transactions";
import type { ApiRequestOptions } from "../../stacks-api/types.js";
import { stacksRpcApi } from "../../stacks-rpc-api/index.js";
import { error, success } from "../../utils/safe.js";
import { type Network, networkDependentValues } from "../constants.js";
import type { PoxAddr } from "./common.js";

type Args = {
  principal: string;
  network: Network;
} & ApiRequestOptions;

type GetCheckDelegationReturn = OptionalCV<
  TupleCV<{
    "amount-ustx": UIntCV;
    "delegated-to": PrincipalCV;
    "until-burn-ht": OptionalCV<UIntCV>;
    "pox-addr": PoxAddr;
  }>
>;

export async function getCheckDelegation({
  principal,
  network,
  baseUrl,
  apiKeyConfig,
}: Args) {
  const [readOnlyError, readOnlyData] =
    await stacksRpcApi.smartContracts.readOnly({
      contractAddress: networkDependentValues(network).pox4ContractAddress,
      contractName: networkDependentValues(network).pox4ContractName,
      functionName: "get-check-delegation",
      arguments: [cvToHex(principalCV(principal))],
      baseUrl,
      apiKeyConfig,
      sender: principal,
    });

  if (readOnlyError) {
    return error({
      name: "GetCheckDelegationError",
      message: "Failed to get check delegation.",
      data: readOnlyError,
    });
  }

  if (!readOnlyData.okay) {
    return error({
      name: "GetCheckDelegationFunctionCallError",
      message: "Call to `get-check-delegation` failed.",
      data: readOnlyData,
    });
  }

  return success(hexToCV(readOnlyData.result) as GetCheckDelegationReturn);
}
