# Markets & Spot — données publiques (GET)

Endpoints de lecture publics (aucune signature) : données de marché et spot/bridge.
Toutes les réponses sont **mappées en camelCase**.

## Initialisation

Le SDK s'initialise **une fois** ; toute l'API hérite ensuite de cette configuration.

```ts
import { init, TESTNET_REST_URL } from '@blackcube/pacifica-sdk';

init();                          // mainnet par défaut
init({ network: 'testnet' });    // testnet
init({ restUrl: '...', wsUrl: '...', fetch: customFetch }); // overrides explicites
```

| Option | Type | Défaut |
|---|---|---|
| `network` | `'mainnet' \| 'testnet'` | `'mainnet'` |
| `restUrl` | `string` | URL selon `network` |
| `wsUrl` | `string` | URL selon `network` |
| `fetch` | `FetchLike` | `globalThis.fetch` |

Appeler une fonction de l'API avant `init()` lève `Pacifica SDK not initialized`.
`resetConfig()` réinitialise (utile en test).

## Erreurs

Toute réponse HTTP non-2xx ou `{ success: false }` lève une `PacificaApiError`
(`status`, `code`, `message`).

## Market data

| Fonction | Endpoint | Retour |
|---|---|---|
| `getMarketInfo()` | `GET /info` | `Market[]` |
| `getPrices()` | `GET /info/prices` | `Price[]` |
| `getFeeLevels()` | `GET /info/fees` | `FeeLevel[]` |
| `getLoanPool()` | `GET /loan_pool` | `LoanPool` |
| `getCandleData({ symbol, interval, startTime, endTime? })` | `GET /kline` | `Candle[]` |
| `getMarkPriceCandleData({ symbol, interval, startTime, endTime? })` | `GET /kline/mark` | `Candle[]` |
| `getOrderbook({ symbol, aggLevel? })` | `GET /book` | `Orderbook` |
| `getRecentTrades({ symbol })` | `GET /trades` | `RecentTrades` |
| `getHistoricalFunding({ symbol, limit?, cursor? })` | `GET /funding_rate/history` | `Paginated<FundingPoint>` |

```ts
const prices = await getPrices();
const candles = getCandleData({ symbol: 'BTC', interval: CandleInterval.OneMinute, startTime: Date.now() - 3_600_000 });
const book = getOrderbook({ symbol: 'BTC' }); // book.bids / book.asks
```

## Spot / Bridge

| Fonction | Endpoint | Retour |
|---|---|---|
| `getSpotAssets({ includeInactive?, collateralEnabledOnly? })` | `GET /spot_assets` | `SpotAsset[]` |
| `getBridgeInfo()` | `GET /spot_assets/bridge/info` | `BridgeAsset[]` |
| `getBridgeParams({ symbol })` | `GET /spot_assets/bridge/parameters/{symbol}` | `BridgeAsset` |

## Pagination

```ts
interface Paginated<TItem> { items: TItem[]; nextCursor: string | null; hasMore: boolean; }
```

## Conventions / cas limites

- **Orderbook** : l'API renvoie un seul tableau `l = [bids[], asks[]]` ; le SDK l'expose en
  `bids` / `asks` séparés (jusqu'à 10 niveaux chacun, `price`/`amount`/`orderCount`).
- **Candles** : clés courtes API (`t,T,o,c,h,l,v,n`) mappées en
  `openTime/closeTime/open/close/high/low/volume/tradeCount`. Le volume des candles mark price
  vaut toujours `"0"`.
- **`getRecentTrades`** : `lastOrderId` (nonce exchange-wide) est exposé à côté des trades.
- `Market.createdAt` est typé `number` (ms) — la doc Pacifica annonce "ISO 8601 string" mais
  renvoie un timestamp ms ; à surveiller si l'API change.
- Tous les montants/prix sont des **strings décimales**.
