# REST API — Markets

Public market data (GET, unsigned). Responses mapped to camelCase.

Authority: 🔓 **Public** — no signer for any function on this page. Each takes a trailing optional
`label?` that selects the network (no label → mainnet; a label → its signer's network).

| Function | Endpoint | Returns |
|---|---|---|
| `getMarketInfo(label?)` | `GET /info` | `Market[]` |
| `getPrices(label?)` | `GET /info/prices` | `Price[]` |
| `getFeeLevels(label?)` | `GET /info/fees` | `FeeLevel[]` |
| `getCandleData({ symbol, interval, startTime, endTime? }, label?)` | `GET /kline` | `Candle[]` |
| `getMarkPriceCandleData({ symbol, interval, startTime, endTime? }, label?)` | `GET /kline/mark` | `Candle[]` |
| `getOrderbook({ symbol, aggLevel? }, label?)` | `GET /book` | `Orderbook` |
| `getRecentTrades({ symbol }, label?)` | `GET /trades` | `RecentTrades` |
| `getHistoricalFunding({ symbol, limit?, cursor? }, label?)` | `GET /funding_rate/history` | `Paginated<FundingPoint>` |
| `getLoanPool(label?)` | `GET /loan_pool` | `LoanPool` |

```ts
const prices = await getPrices();                        // mainnet (no label)
const testPrices = await getPrices('tester');            // testnet (the label's network)
const book = getOrderbook({ symbol: 'BTC' });            // book.bids / book.asks
const candles = getCandleData({ symbol: 'BTC', interval: CandleInterval.OneMinute, startTime: Date.now() - 3_600_000 });
```

## Notes

- **Orderbook**: the API returns a single array `l = [bids[], asks[]]`; the SDK exposes it as
  separate `bids` / `asks` (`{ price, amount, orderCount }`, up to 10 levels).
- **Candles**: format unifié Blackcube à clés courtes `{ t, T, s, i, o, c, h, l, v, n, kind }`
  (t/T = open/close ms, s = symbole, i = intervalle, v = volume base, n = nb trades,
  kind = `'perp'`). Identique aux SDK hyperliquid/aster. Intervalles via `CandleInterval`.
- `getRecentTrades` exposes `lastOrderId` (exchange-wide nonce) alongside `trades`.
- `Market.createdAt` is typed as `number` (ms); the Pacifica docs claim "ISO 8601 string" but
  the API returns a millisecond timestamp.
- `getCandleData`: `startTime` is required.
