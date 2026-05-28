# REST API — Orders

Order reads (public GET) and signed writes (`signer?`). Amounts/prices are strings;
`clientOrderId` is auto-generated (UUID v4) when omitted.

## Read (GET, unsigned)

| Function | Endpoint | Returns |
|---|---|---|
| `getOpenOrders({ account })` | `GET /orders` | `Order[]` |
| `getOrderHistory({ account, limit?, cursor? })` | `GET /orders/history` | `Paginated<OrderHistoryEntry>` |
| `getOrderHistoryById({ orderId })` | `GET /orders/history_by_id` | `OrderHistoryByIdEntry[]` |

## Writes (signed)

| Function | signature type | Endpoint | Returns |
|---|---|---|---|
| `createLimitOrder(params, signer?)` | `create_order` | `POST /orders/create` | `CreateOrderResult` |
| `createMarketOrder(params, signer?)` | `create_market_order` | `POST /orders/create_market` | `CreateOrderResult` |
| `cancelOrder(params, signer?)` | `cancel_order` | `POST /orders/cancel` | `void` |
| `cancelAllOrders(params, signer?)` | `cancel_all_orders` | `POST /orders/cancel_all` | `CancelAllResult` |
| `editOrder(params, signer?)` | `edit_order` | `POST /orders/edit` | `CreateOrderResult` |
| `createStopOrder(params, signer?)` | `create_stop_order` | `POST /orders/stop/create` | `CreateOrderResult` |
| `cancelStopOrder(params, signer?)` | `cancel_stop_order` | `POST /orders/stop/cancel` | `void` |
| `createPositionTpsl(params, signer?)` | `set_position_tpsl` | `POST /positions/tpsl` | `void` |
| `batchOrders(actions, signer?)` | *(per action)* | `POST /orders/batch` | `BatchResult` |

### Params

- `createLimitOrder`: `{ symbol, price, amount, side, tif?, reduceOnly?, clientOrderId?, takeProfit?, stopLoss?, builderCode? }` (`tif` defaults to `GTC`).
- `createMarketOrder`: `{ symbol, amount, side, slippagePercent, reduceOnly?, clientOrderId?, takeProfit?, stopLoss?, builderCode? }`.
- `cancelOrder` / `cancelStopOrder`: `{ symbol, orderId? | clientOrderId? }`.
- `cancelAllOrders`: `{ allSymbols, excludeReduceOnly, symbol? }`.
- `editOrder`: `{ symbol, price, amount, orderId? | clientOrderId? }` (cancels and recreates the order with TIF=ALO).
- `createStopOrder`: `{ symbol, side, reduceOnly, stopOrder: { stopPrice, limitPrice?, clientOrderId?, triggerPriceType?, amount? }, builderCode? }`.
- `createPositionTpsl`: `{ symbol, side, takeProfit?, stopLoss? }`.
- `StopConfig` (TP/SL): `{ stopPrice, limitPrice?, clientOrderId?, triggerPriceType? }` (`triggerPriceType`: `mark_price` default, `last_trade_price`, `mid_price`).

### Batch

```ts
batchOrders([
  { type: BatchActionType.Create, params: { symbol: 'BTC', price: '50000', amount: '0.001', side: OrderSide.Bid } },
  { type: BatchActionType.Cancel, params: { symbol: 'ETH', orderId: 123 } },
]);
```

Each action is **signed individually** (no global batch signature). Max 10, atomic.
Types: `Create`, `CreateMarket`, `Cancel`, `Edit`, `SetPositionTpsl`, `CancelStopOrder`.
Returns `BatchResult { results: { success, orderId?, error }[] }`.

## TWAP (read)

| Function | Endpoint | Returns |
|---|---|---|
| `getOpenTwapOrder({ account })` | `GET /orders/twap` | `JsonObject[]` |
| `getTwapOrderHistory({ account, limit?, cursor? })` | `GET /orders/twap/history` | `Paginated<JsonObject>` |
| `getTwapOrderHistoryById({ orderId })` | `GET /orders/twap/history_by_id` | `JsonObject[]` |

> TWAP endpoints are not documented on gitbook (source: Python SDK) and are empty on the test
> account → entries typed as `JsonObject` (shape unconfirmed).
