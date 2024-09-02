import { error, safePromise, success, type Result } from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";
import * as v from "valibot";

export type Options = {
  sender: string;
  arguments: string[];
  contractAddress: string;
  contractName: string;
  functionName: string;
};

export const readOnlyResponseSchema = v.variant("okay", [
  v.object({
    okay: v.literal(true),
    result: v.string(),
  }),
  v.object({
    okay: v.literal(false),
    cause: v.unknown(),
  }),
]);
export type ReadOnlyResponse = v.InferOutput<typeof readOnlyResponseSchema>;

export async function readOnly(
  opts: Options,
  apiOpts: ApiRequestOptions,
): Promise<Result<ReadOnlyResponse>> {
  const init: RequestInit = {};
  if (apiOpts.apiKeyConfig) {
    init.headers = {
      [apiOpts.apiKeyConfig.header]: apiOpts.apiKeyConfig.key,
    };
  }

  const res = await fetch(
    `${apiOpts.baseUrl}/v2/contracts/call-read/${opts.contractAddress}/${opts.contractName}/${opts.functionName}`,
    init,
  );

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
