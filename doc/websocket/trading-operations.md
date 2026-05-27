# WebSocket — Trading operations

Actions de trading signées via WebSocket, **mêmes noms et types que le REST** (réutilisent
`buildSignedRequest` + les builders de payload). Méthodes du `WsClient`. Chaque action résout
avec la réponse du serveur (corrélée par `id`).

| Méthode | format envoyé |
|---|---|
| `createLimitOrder(params, signer?)` | `{ id, params: { create_order: <signé> } }` |
| `createMarketOrder(params, signer?)` | `{ id, params: { create_market_order: <signé> } }` |
| `cancelOrder(params, signer?)` | `{ id, params: { cancel_order: <signé> } }` |
| `cancelAllOrders(params, signer?)` | `{ id, params: { cancel_all_orders: <signé> } }` |
| `editOrder(params, signer?)` | `{ id, params: { edit_order: <signé> } }` |
| `batchOrders(actions, signer?)` | `{ id, params: { actions: [<signé>, …] } }` |

```ts
ws.connect().then(() => {
  return ws.createLimitOrder({ symbol: 'BTC', price: '50000', amount: '0.001', side: OrderSide.Bid });
}).then((response) => console.log(response));
```

Les types de params sont **identiques** à ceux du [REST Orders](../rest-api/orders.md)
(`CreateLimitOrderParams`, `CreateMarketOrderParams`, `CancelOrderParams`, etc.).
`sendAction<T>(params)` permet d'envoyer une action brute. Une action avant `connect()` lève
« WebSocket is not connected ».
