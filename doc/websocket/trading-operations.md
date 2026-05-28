# WebSocket — Trading operations

Signed trading actions over WebSocket, with the **same names and types as REST** (they reuse
`buildSignedRequest` + the payload builders). `WsClient` methods. Each action resolves with the
server response (correlated by `id`).

| Method | sent format |
|---|---|
| `createLimitOrder(params, account?)` | `{ id, params: { create_order: <signed> } }` |
| `createMarketOrder(params, account?)` | `{ id, params: { create_market_order: <signed> } }` |
| `cancelOrder(params, account?)` | `{ id, params: { cancel_order: <signed> } }` |
| `cancelAllOrders(params, account?)` | `{ id, params: { cancel_all_orders: <signed> } }` |
| `editOrder(params, account?)` | `{ id, params: { edit_order: <signed> } }` |
| `batchOrders(actions, account?)` | `{ id, params: { actions: [<signed>, …] } }` |

```ts
ws.connect().then(() => {
  return ws.createLimitOrder({ symbol: 'BTC', price: '50000', amount: '0.001', side: OrderSide.Bid });
}).then((response) => console.log(response));
```

Param types are **identical** to [REST Orders](../rest-api/orders.md)
(`CreateLimitOrderParams`, `CreateMarketOrderParams`, `CancelOrderParams`, etc.).
`sendAction<T>(params)` sends a raw action. An action before `connect()` throws
"WebSocket is not connected".
