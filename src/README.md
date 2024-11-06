# Clients

Several clients are provided for requests to Stacks APIs and PoX managment.

Types for `stacksApi` and `stacksRpcApi` are provided on a "best effort" basis. They are based on the types available or documented in:

- https://github.com/hirosystems/stacks-blockchain-api
- https://github.com/hirosystems/docs

The types change from time to time, either in value or location, and are ported here when needed. Help keep the types updated by opening a PR when type updates are needed.

## API Client

Helper methods to call Hiro's Stacks API. The helpers aim to be more convenient than raw `fetch` calls by

- typing all arguments, regardless of whether they end up as URL parameters or in the request body
- typing responses
- wrapping errors in a safe `Result` rather than throwing on error

Not all endpoints have helpers currently, this is a work in progress. PRs adding new helpers are welcome.

Each endpoint helper is in its own file, with the name of the path following that used by the Hiro docs. For example, a helper for an endpoint documented at `https://docs.hiro.so/stacks/api/{category}/{endpoint-name}` would be available as `endpointName()` from `./category/endpoint-name.ts`.

Types for responses are taken from `@stacks/blockchain-api-client`. Particularly, using its `OperationResponse` helper type and the operation name.

### Doesn't Hiro already have an API client?

The API client provided by Hiro is `class` based and keeps internal state. The helpers provided here are pure functions.

Hiro's client is not the most straight forward to use. It [requires users to remember the HTTP verb and path of the endpoint](https://github.com/hirosystems/stacks-blockchain-api/blob/develop/client/MIGRATION.md#performing-requests). Arguments for requests need to be provided in several places, such as the URL path, URL params, and payload, which is not very ergonomic.

The methods provided here conveniently use a single config object and take care of constructing the request with the appropriate URL path and HTTP verb.

## RPC API Client

Follows the same pattern as the API Client described above. The types for responses are copied from available documentation and source code since they are not available as exports.
