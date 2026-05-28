# WebSocket — Subscriptions

Real-time streams via `WsClient`. The `label` passed at construction picks the network (no label →
mainnet) and the signer used by trading actions.

```ts
import { WsClient, CandleInterval } from '@blackcube/pacifica-sdk';

const ws = new WsClient({ label: 'tester' });   // or new WsClient({ url, webSocket, label })
ws.connect().then(() => {
  const off = ws.subscribePrices((data) => console.log(data));
  // ...
  off();           // unsubscribe
  ws.disconnect();
});
```

## Lifecycle

| Method | Purpose |
|---|---|
| `connect(): Promise<void>` | Opens the connection, starts the heartbeat |
| `disconnect()` | Closes and stops auto-reconnect |
| `startHeartbeat(ms=30000)` / `stopHeartbeat()` | `ping`/`pong` (60s server timeout, 24h max) |
| `onMessage / onError / onClose / onReconnect` | Callbacks (properties) |
| `subscribe(params)` / `unsubscribe(params)` | Raw `{ method, params }` send |

**Auto-reconnect**: on close, reconnects and **re-sends active subscriptions**, then calls `onReconnect`.
**WebSocket**: `globalThis.WebSocket` by default (browser + Node ≥22), injectable.

## Subscriptions

Each `subscribeXxx(...)` returns an unsubscribe function. The stream `data` is delivered to the callback (`JsonValue`).

Authority: 🔓 **Public** — market streams (`prices`, `book`, `bbo`, `trades`, `candle`,
`mark_price_candle`) need no credential. Account streams (`subscribeAccountXxx`) need only the
**account address** (no signature) — pass it explicitly as `account`, or rely on the client's
`label` signer (its `publicKey`).

| Method | source |
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

Account subscriptions use the `account` argument, else the client's `label` signer (its `publicKey`).
`orderbook` uses the `book` source. The `{ channel: "pong" }` message is ignored by the dispatcher.
