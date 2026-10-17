# api-client

HTTP client for the MyBasket backend. Plain TypeScript over `fetch` (no axios), shared by every feature so none of them builds requests, attaches the token or parses errors on its own.

## What it does

- Sends the **access token** (not the ID token) as `Authorization: Bearer`.
- Serializes the body as JSON and parses the JSON answer; `204` resolves `undefined`.
- Turns every failure into an `ApiError` with a stable `code`: `unauthorized`, `not-found`, `validation` (400), `network`, `server` (5xx) or `unknown`. The UI maps the code to a message; `detail` holds the backend text for logs only.
- Reads both backend error shapes: `{ "error": "..." }` and API Gateway's `{ "message": "..." }`.

## What it does not know

It does not depend on `auth-flow`. The host injects a `getAccessToken` function, so the dependency is wired in one place:

```ts
const apiClient = createApiClient({
  baseUrl: apiBaseUrl,
  getAccessToken: () => authService.getAccessToken(),
});

const products = await apiClient.request<Product[]>('/products');
await apiClient.request('/products', {
  method: 'POST',
  body: { name: 'Milk' },
});
```

When `getAccessToken` resolves `null` there is no session: the request is not sent and fails as `unauthorized`.

## Not built yet

- Retry once after a 401 (renew the token and repeat). The place for it is `send` in `createApiClient.ts`. Concurrent 401s must share a single renewal.
- Retry with backoff on `server` errors (the backend can answer 500 under DynamoDB throttling).

## Testing

`npm test` runs the Jest suite with an injected `fetch`. Build: `npm run build`.
