# WebSocket — `WsClient`

Client WebSocket temps réel : subscriptions (données) et actions signées (trading), avec
les **mêmes noms et types que le REST**. URL et signer hérités de `init()`.

## Cycle de vie

```ts
import { init, WsClient, CandleInterval } from '@blackcube/pacifica-sdk';

init({ network: 'testnet', signer: { secretKey } });

const ws = new WsClient();          // ou new WsClient({ url, webSocket, signer })
ws.connect().then(() => {
  const off = ws.subscribePrices((data) => console.log(data));
  // ...
  off();              // se désabonne
  ws.disconnect();
});
```

| Méthode | Rôle |
|---|---|
| `connect(): Promise<void>` | Ouvre la connexion (résout à l'ouverture), démarre le heartbeat |
| `disconnect()` | Ferme et coupe l'auto-reconnect |
| `subscribe(params)` / `unsubscribe(params)` | Envoi brut `{method, params}` |
| `sendAction<T>(params): Promise<T>` | Envoie `{id, params}`, résout sur la réponse de même `id` |
| `startHeartbeat(ms=30000)` / `stopHeartbeat()` | `ping`/`pong` (timeout serveur 60s) |
| `onMessage / onError / onClose / onReconnect` | Callbacks (propriétés) |

**Auto-reconnect** : à la fermeture (timeout 60s sans message, ou >24h), le client se
reconnecte et **réémet les subscriptions actives**, puis appelle `onReconnect`.

**WebSocket sous-jacent** : `globalThis.WebSocket` par défaut (navigateur + Node ≥22),
injectable via `init({ webSocket })` ou `new WsClient({ webSocket })`.

## Subscriptions

Chaque `subscribeXxx(...)` renvoie une fonction de désabonnement. Le `data` du stream est
livré au callback (typé `JsonValue`).

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

Les subscriptions de compte utilisent l'`account` passé en argument, sinon celui dérivé du
signer d'`init()`.

## Actions signées (mêmes noms/types que le REST)

| Méthode | format envoyé |
|---|---|
| `createLimitOrder(params, signer?)` | `{ create_order: <signé> }` |
| `createMarketOrder(params, signer?)` | `{ create_market_order: <signé> }` |
| `cancelOrder(params, signer?)` | `{ cancel_order: <signé> }` |
| `cancelAllOrders(params, signer?)` | `{ cancel_all_orders: <signé> }` |
| `editOrder(params, signer?)` | `{ edit_order: <signé> }` |
| `batchOrders(actions, signer?)` | `{ actions: [<signé>, …] }` |

Les types de params et les payloads sont **identiques au REST** (réutilisent
`buildSignedRequest` + les builders de payload). Chaque action résout avec la réponse du
serveur (corrélée par `id`).

## Cas limites

- `subscribe`/action avant `connect()` → erreur « WebSocket is not connected ».
- Le message `{ channel: "pong" }` (réponse heartbeat) est ignoré du dispatch.
- `orderbook` utilise la source `book` (pas `orderbook`).
