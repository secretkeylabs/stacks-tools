import type { ClarityAbi } from "@stacks/transactions";
import type { ApiRequestOptions, ProofAndTip } from "../../stacks-api/types.js";
import {
  error,
  safePromise,
  safeExtractResponseBody,
  success,
  type Result,
} from "../../utils/safe.js";

export type Args = {
  contractAddress: string;
  contractName: string;
} & ApiRequestOptions &
  ProofAndTip;

export type InterfaceResponse = ClarityAbi;

export async function contractInterface(
  args: Args,
): Promise<Result<InterfaceResponse>> {
  const search = new URLSearchParams();
  if (args.proof === 0) search.append("proof", "0");
  if (args.tip) search.append("tip", args.tip);

  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const endpoint = `${args.baseUrl}/v2/contracts/interface/${args.contractAddress}/${args.contractName}`;
  const res = await fetch(endpoint, init);
  if (!res.ok) {
    return error({
      name: "FetcContractInterfaceError",
      message: "Failed to fetch contract interface.",
      data: {
        init,
        status: res.status,
        statusText: res.statusText,
        endpoint,
        body: await safeExtractResponseBody(res),
      },
    });
  }

  const [jsonError, data] = await safePromise(res.json());
  if (jsonError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body as JSON.",
      data: jsonError,
    });
  }

  return success(data as InterfaceResponse);
}
