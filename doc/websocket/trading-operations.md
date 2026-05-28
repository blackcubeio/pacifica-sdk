# WebSocket — Trading operations

Signed trading actions over WebSocket, with the **same names and types as REST** (they reuse
`buildSignedRequest` + the payload builders). `WsClient` methods. Each action resolves with the
server response (correlated by `id`).

Authority: 🔑 **Account key or API key** — the account's own key, or a bound API key for that
account (same rules as the equivalent REST writes). They sign with the client's `label` (set at
construction): `new WsClient({ label: 'tester' })` — no per-call signer argument.

| Method | sent format |
|---|---|
| `createLimitOrder(params)` | `{ id, params: { create_order: <signed> } }` |
| `createMarketOrder(params)` | `{ id, params: { create_market_order: <signed> } }` |
| `cancelOrder(params)` | `{ id, params: { cancel_order: <signed> } }` |
| `cancelAllOrders(params)` | `{ id, params: { cancel_all_orders: <signed> } }` |
| `editOrder(params)` | `{ id, params: { edit_order: <signed> } }` |
| `batchOrders(actions)` | `{ id, params: { actions: [<signed>, …] } }` |

```ts
ws.connect().then(() => {
  return ws.createLimitOrder({ symbol: 'BTC', price: '50000', amount: '0.001', side: OrderSide.Bid });
}).then((response) => console.log(response));
```

Param types are **identical** to [REST Orders](../rest-api/orders.md)
(`CreateLimitOrderParams`, `CreateMarketOrderParams`, `CancelOrderParams`, etc.).
`sendAction<T>(params)` sends a raw action. An action before `connect()` throws
"WebSocket is not connected".
