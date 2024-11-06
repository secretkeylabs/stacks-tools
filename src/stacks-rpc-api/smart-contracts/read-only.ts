import { error, safePromise, success, type Result } from "../../utils/safe.js";
import type { ApiRequestOptions } from "../../stacks-api/types.js";

export type Args = {
  sender: string;
  arguments: string[];
  contractAddress: string;
  contractName: string;
  functionName: string;
} & ApiRequestOptions;

// These interfaces have been copied over from source since they are not
// available from existing libraries.
// https://github.com/hirosystems/stacks-blockchain-api/blob/f0176a038b3c4fde35195bbfbf9b6d8d5504c9bb/src/core-rpc/client.ts#L94-L106
interface ReadOnlyContractCallSuccessResponse {
  okay: true;
  result: string;
}
interface ReadOnlyContractCallFailResponse {
  okay: false;
  cause: string;
}
export type ReadOnlyContractCallResponse =
  | ReadOnlyContractCallSuccessResponse
  | ReadOnlyContractCallFailResponse;

export type ReadOnlyResponse = ReadOnlyContractCallResponse;

export async function readOnly(args: Args): Promise<Result<ReadOnlyResponse>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (args.apiKeyConfig) {
    headers[args.apiKeyConfig.header] = args.apiKeyConfig.key;
  }

  const init: RequestInit = {
    method: "POST",
    body: JSON.stringify({
      sender: args.sender,
      arguments: args.arguments,
    }),
    headers,
  };

  const endpoint = `${args.baseUrl}/v2/contracts/call-read/${args.contractAddress}/${args.contractName}/${args.functionName}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchReadOnlyError",
      message: "Failed to fetch.",
      data: {
        status: res.status,
        statusText: res.statusText,
        bodyParseResult: await safePromise(res.json()),
      },
    });
  }

  const [jsonError, data] = await safePromise(res.json());
  if (jsonError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body as JSON.",
      data: error,
    });
  }

  return success(data as ReadOnlyResponse);
}
