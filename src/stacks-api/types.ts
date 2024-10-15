import * as v from "valibot";

export type ApiKeyConfig = {
  key: string;
  /**
   * The header to use for the API key. For example, the Hiro API uses the
   * header `x-api-key`.
   */
  header: string;
};

export type ApiRequestOptions = {
  baseUrl: string;
  apiKeyConfig?: ApiKeyConfig;
};

export type ProofAndTip = {
  /**
   * Returns object without the proof field when set to 0.
   */
  proof?: number;
  tip?: "latest" | string;
};

export type ApiPaginationOptions = {
  /**
   * The number of items to return. Each endpoint has its own maximum allowed
   * limit, although many support at least 50 items. The [Hiro
   * docs](https://docs.hiro.so/stacks/api) include the allowed maximum for each
   * endpoint.
   */
  limit?: number;
  offset?: number;
};

export type ApiClientOptions = Partial<ApiRequestOptions>;

export const baseListResponseSchema = v.object({
  limit: v.number(),
  offset: v.number(),
  total: v.number(),
  results: v.array(v.unknown()),
});
