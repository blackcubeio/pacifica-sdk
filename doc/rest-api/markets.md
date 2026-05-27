# REST API — Markets

Données de marché publiques (GET, non signées). Réponses mappées camelCase.

| Fonction | Endpoint | Retour |
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

- **Orderbook** : l'API renvoie un seul tableau `l = [bids[], asks[]]` ; le SDK l'expose en
  `bids` / `asks` séparés (`{ price, amount, orderCount }`, ≤10 niveaux).
- **Candles** : clés courtes API (`t,T,o,c,h,l,v,n`) mappées
  `openTime/closeTime/open/close/high/low/volume/tradeCount`. Intervalles via `CandleInterval`.
- `getRecentTrades` expose `lastOrderId` (nonce exchange-wide) à côté des `trades`.
- `Market.createdAt` typé `number` (ms) ; la doc Pacifica annonce "ISO 8601 string" mais renvoie un timestamp ms.
- `getCandleData` : `startTime` requis.
