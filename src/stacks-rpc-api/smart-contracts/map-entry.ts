import type { ApiRequestOptions, ProofAndTip } from "../../stacks-api/types.js";
import { error, safePromise, success, type Result } from "../../utils/safe.js";
import * as v from "valibot";

export type Args = {
  contractAddress: string;
  contractName: string;
  mapName: string;

  /**
   * Hex-encoded string of the map key Clarity value.
   */
  mapKey: string;
} & ApiRequestOptions &
  ProofAndTip;

const mapEntryResponseSchema = v.object({
  /**
   * Hex-encoded string of clarity value. It is always an optional tuple.
   */
  data: v.string(),
  /**
   * Hex-encoded string of the MARF proof for the data
   */
  proof: v.optional(v.string()),
});
export type MapEntryResponse = v.InferOutput<typeof mapEntryResponseSchema>;

export async function mapEntry(args: Args): Promise<Result<MapEntryResponse>> {
  const search = new URLSearchParams();
  if (args.proof === 0) search.append("proof", "0");
  if (args.tip) search.append("tip", args.tip);

  const init: RequestInit = {};
  if (args.apiKeyConfig) {
    init.headers = {
      [args.apiKeyConfig.header]: args.apiKeyConfig.key,
    };
  }
  init.method = "POST";
  init.body = JSON.stringify(
    args.mapKey.startsWith("0x") ? args.mapKey : `0x${args.mapKey}`,
  );
  init.headers = { ...init.headers, "Content-Type": "application/json" };

  const endpoint = `${args.baseUrl}/v2/map_entry/${args.contractAddress}/${args.contractName}/${args.mapName}?${search}`;
  const res = await fetch(endpoint, init);
  if (!res.ok) {
    return error({
      name: "FetchMapEntryError",
      message: "Failed to fetch map entry.",
      data: {
        init,
        status: res.status,
        statusText: res.statusText,
        endpoint,
        bodyText: await safePromise(res.text()),
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

  const validationResult = v.safeParse(mapEntryResponseSchema, data);
  if (!validationResult.success) {
    return error({
      name: "ValidateDataError",
      message: "Failed to validate response data.",
      data: validationResult,
    });
  }

  return success(validationResult.output);
}
