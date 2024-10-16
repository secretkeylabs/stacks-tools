import { error, safePromise, success, type Result } from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";
import * as v from "valibot";

export type Args = {
  sender: string;
  arguments: string[];
  contractAddress: string;
  contractName: string;
  functionName: string;
} & ApiRequestOptions;

export const readOnlyResponseSchema = v.variant("okay", [
  v.object({
    okay: v.literal(true),
    /**
     * A Clarity value as a hex-encoded string.
     */
    result: v.string(),
  }),
  v.object({
    okay: v.literal(false),
    cause: v.unknown(),
  }),
]);
export type ReadOnlyResponse = v.InferOutput<typeof readOnlyResponseSchema>;

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

  const validationResult = v.safeParse(readOnlyResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
