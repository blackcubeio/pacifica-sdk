# REST API — Orders

Lecture des ordres (GET publics) et écritures signées (`signer?`). Montants/prix = strings ;
`clientOrderId` auto-généré (UUID v4) si absent.

## Lecture (GET, non signé)

| Fonction | Endpoint | Retour |
|---|---|---|
| `getOpenOrders({ account })` | `GET /orders` | `Order[]` |
| `getOrderHistory({ account, limit?, cursor? })` | `GET /orders/history` | `Paginated<OrderHistoryEntry>` |
| `getOrderHistoryById({ orderId })` | `GET /orders/history_by_id` | `OrderHistoryByIdEntry[]` |

## Écritures (signées)

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `createLimitOrder(params, signer?)` | `create_order` | `POST /orders/create` | `CreateOrderResult` |
| `createMarketOrder(params, signer?)` | `create_market_order` | `POST /orders/create_market` | `CreateOrderResult` |
| `cancelOrder(params, signer?)` | `cancel_order` | `POST /orders/cancel` | `void` |
| `cancelAllOrders(params, signer?)` | `cancel_all_orders` | `POST /orders/cancel_all` | `CancelAllResult` |
| `editOrder(params, signer?)` | `edit_order` | `POST /orders/edit` | `CreateOrderResult` |
| `createStopOrder(params, signer?)` | `create_stop_order` | `POST /orders/stop/create` | `CreateOrderResult` |
| `cancelStopOrder(params, signer?)` | `cancel_stop_order` | `POST /orders/stop/cancel` | `void` |
| `createPositionTpsl(params, signer?)` | `set_position_tpsl` | `POST /positions/tpsl` | `void` |
| `batchOrders(actions, signer?)` | *(par action)* | `POST /orders/batch` | `BatchResult` |

### Params

- `createLimitOrder` : `{ symbol, price, amount, side, tif?, reduceOnly?, clientOrderId?, takeProfit?, stopLoss?, builderCode? }` (`tif` défaut `GTC`).
- `createMarketOrder` : `{ symbol, amount, side, slippagePercent, reduceOnly?, clientOrderId?, takeProfit?, stopLoss?, builderCode? }`.
- `cancelOrder` / `cancelStopOrder` : `{ symbol, orderId? | clientOrderId? }`.
- `cancelAllOrders` : `{ allSymbols, excludeReduceOnly, symbol? }`.
- `editOrder` : `{ symbol, price, amount, orderId? | clientOrderId? }` (recrée l'ordre en TIF=ALO).
- `createStopOrder` : `{ symbol, side, reduceOnly, stopOrder: { stopPrice, limitPrice?, clientOrderId?, triggerPriceType?, amount? }, builderCode? }`.
- `createPositionTpsl` : `{ symbol, side, takeProfit?, stopLoss? }`.
- `StopConfig` (TP/SL) : `{ stopPrice, limitPrice?, clientOrderId?, triggerPriceType? }` (`triggerPriceType` : `mark_price` défaut, `last_trade_price`, `mid_price`).

### Batch

```ts
batchOrders([
  { type: BatchActionType.Create, params: { symbol: 'BTC', price: '50000', amount: '0.001', side: OrderSide.Bid } },
  { type: BatchActionType.Cancel, params: { symbol: 'ETH', orderId: 123 } },
]);
```

Chaque action est **signée individuellement** (pas de signature globale). Max 10, atomique.
Types : `Create`, `CreateMarket`, `Cancel`, `Edit`, `SetPositionTpsl`, `CancelStopOrder`.
Retour : `BatchResult { results: { success, orderId?, error }[] }`.

## TWAP (lecture)

| Fonction | Endpoint | Retour |
|---|---|---|
| `getOpenTwapOrder({ account })` | `GET /orders/twap` | `JsonObject[]` |
| `getTwapOrderHistory({ account, limit?, cursor? })` | `GET /orders/twap/history` | `Paginated<JsonObject>` |
| `getTwapOrderHistoryById({ orderId })` | `GET /orders/twap/history_by_id` | `JsonObject[]` |

> Endpoints TWAP non documentés sur gitbook (source : SDK Python) et vides sur le compte de
> test → entrées typées `JsonObject` (forme non confirmée).
