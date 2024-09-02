import * as v from "valibot";

export type ApiKeyConfig = {
  key: string;
  header: string;
};

export type ApiRequestOptions = {
  baseUrl: string;
  apiKeyConfig?: ApiKeyConfig;
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
