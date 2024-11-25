import { success, error, safePromise, type Result } from "../../utils/safe.js";
import type { ApiRequestOptions } from "../types.js";
import { transactionSchema, type Transaction } from "./schemas.js";
import * as v from "valibot";

type Args = {
  transactionId: string;
} & ApiRequestOptions;

export async function getTransaction(args: Args): Promise<Result<Transaction>> {
  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }

  const endpoint = `${args.baseUrl}/extended/v1/tx/${args.transactionId}`;
  const res = await fetch(endpoint, init);

  if (!res.ok) {
    return error({
      name: "FetchTransactionError",
      message: `Failed to fetch transaction ${args.transactionId}`,
      response: {
        status: res.status,
        statusText: res.statusText,
        bodyText: await safePromise(res.text()),
      },
    });
  }

  const [jsonParseError, data] = await safePromise(res.json());
  if (jsonParseError) {
    return error({
      name: "ParseBodyError",
      message: "Failed to parse response body as JSON.",
      error: jsonParseError,
    });
  }

  const validationResult = v.safeParse(transactionSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate data.",
      error: validationResult,
    });
  }

  return success(validationResult.output);
}
