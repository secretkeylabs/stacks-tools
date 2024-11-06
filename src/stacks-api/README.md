# Hiro API

Helper methods to call Hiro's Stacks API. The helpers aim to be more convenient than raw `fetch` calls by

- typing all arguments, regardless of whether they end up as URL parameters or in the request body
- typing responses
- wrapping errors in a safe `Result` rather than throwing on error

Currently not all endpoints have a helper method. This is a work in progress.

Each endpoint is in its own file, with the name of the path following that used by the Hiro docs. For example, a helper for an endpoint documented at `https://docs.hiro.so/stacks/api/{category}/{endpoint-name}` would be available as `endpointName()` from `./category/endpoint-name.ts`.

Types for responses are taken from `@stacks/blockchain-api-client`. Particularly, using its `OperationResponse` helper type and the operation name.

## Doesn't Hiro already have an API client?

The API client provided by Hiro is `class` based and keeps internal state. The helpers provided here are pure functions.

Hiro's client is not the most straight forward to use, and [requires users to remember the HTTP verb and path of the endpoint](https://github.com/hirosystems/stacks-blockchain-api/blob/develop/client/MIGRATION.md#performing-requests). The methods included here use more memorable names and take care of using the correct verb for each endpoint.

Finally, Hiro's API client requires request parameters to be configured in several places as the API implementaiton bleeds into the client API. The methods here conveniently use a single config object.
