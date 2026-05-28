# REST API — Markets

Public market data (GET, unsigned). Responses mapped to camelCase.

| Function | Endpoint | Returns |
|---|---|---|
| `getMarketInfo()` | `GET /info` | `Market[]` |
| `getPrices()` | `GET /info/prices` | `Price[]` |
| `getFeeLevels()` | `GET /info/fees` | `FeeLevel[]` |
| `getCandleData({ symbol, interval, startTime, endTime? })` | `GET /kline` | `Candle[]` |
| `getMarkPriceCandleData({ symbol, interval, startTime, endTime? })` | `GET /kline/mark` | `Candle[]` |
| `getOrderbook({ symbol, aggLevel? })` | `GET /book` | `Orderbook` |
| `getRecentTrades({ symbol })` | `GET /trades` | `RecentTrades` |
| `getHistoricalFunding({ symbol, limit?, cursor? })` | `GET /funding_rate/history` | `Paginated<FundingPoint>` |
| `getLoanPool()` | `GET /loan_pool` | `LoanPool` |

```ts
const prices = await getPrices();
const book = getOrderbook({ symbol: 'BTC' });            // book.bids / book.asks
const candles = getCandleData({ symbol: 'BTC', interval: CandleInterval.OneMinute, startTime: Date.now() - 3_600_000 });
```

## Notes

- **Orderbook**: the API returns a single array `l = [bids[], asks[]]`; the SDK exposes it as
  separate `bids` / `asks` (`{ price, amount, orderCount }`, up to 10 levels).
- **Candles**: short API keys (`t,T,o,c,h,l,v,n`) are mapped to
  `openTime/closeTime/open/close/high/low/volume/tradeCount`. Intervals via `CandleInterval`.
- `getRecentTrades` exposes `lastOrderId` (exchange-wide nonce) alongside `trades`.
- `Market.createdAt` is typed as `number` (ms); the Pacifica docs claim "ISO 8601 string" but
  the API returns a millisecond timestamp.
- `getCandleData`: `startTime` is required.
