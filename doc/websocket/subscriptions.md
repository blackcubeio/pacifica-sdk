# WebSocket — Subscriptions

Flux temps réel via `WsClient`. URL/signer hérités d'`init()`.

```ts
import { WsClient, CandleInterval } from '@blackcube/pacifica-sdk';

const ws = new WsClient();           // ou new WsClient({ url, webSocket, signer })
ws.connect().then(() => {
  const off = ws.subscribePrices((data) => console.log(data));
  // ...
  off();           // se désabonne
  ws.disconnect();
});
```

## Cycle de vie

| Méthode | Rôle |
|---|---|
| `connect(): Promise<void>` | Ouvre la connexion, démarre le heartbeat |
| `disconnect()` | Ferme et coupe l'auto-reconnect |
| `startHeartbeat(ms=30000)` / `stopHeartbeat()` | `ping`/`pong` (timeout serveur 60s, 24h max) |
| `onMessage / onError / onClose / onReconnect` | Callbacks (propriétés) |
| `subscribe(params)` / `unsubscribe(params)` | Envoi brut `{ method, params }` |

**Auto-reconnect** : à la fermeture, reconnexion + **réémission des subscriptions actives**, puis `onReconnect`.
**WebSocket** : `globalThis.WebSocket` par défaut (navigateur + Node ≥22), injectable.

## Subscriptions

Chaque `subscribeXxx(...)` renvoie une fonction de désabonnement. Le `data` du stream est livré au callback (`JsonValue`).

| Méthode | source |
|---|---|
| `subscribePrices(cb)` | `prices` |
| `subscribeOrderbook({ symbol, aggLevel? }, cb)` | `book` |
| `subscribeBbo({ symbol }, cb)` | `bbo` |
| `subscribeTrades({ symbol }, cb)` | `trades` |
| `subscribeCandle({ symbol, interval }, cb)` | `candle` |
| `subscribeMarkPriceCandle({ symbol, interval }, cb)` | `mark_price_candle` |
| `subscribeAccountInfo(cb, account?)` | `account_info` |
| `subscribeAccountPositions(cb, account?)` | `account_positions` |
| `subscribeAccountMargin(cb, account?)` | `account_margin` |
| `subscribeAccountLeverage(cb, account?)` | `account_leverage` |
| `subscribeAccountOrderUpdates(cb, account?)` | `account_order_updates` |
| `subscribeAccountTrades(cb, account?)` | `account_trades` |
| `subscribeAccountTransfers(cb, account?)` | `account_transfers` |
| `subscribeAccountTwapOrders(cb, account?)` | `account_twap_orders` |
| `subscribeAccountTwapUpdates(cb, account?)` | `account_twap_order_updates` |

Les subscriptions de compte utilisent l'`account` passé en argument, sinon celui dérivé du signer d'`init()`.
`orderbook` utilise la source `book`. Le message `{ channel: "pong" }` est ignoré du dispatch.
