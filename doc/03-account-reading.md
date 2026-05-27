# Account reading — lectures privées (GET)

Endpoints de lecture du compte, des positions, ordres et historiques. **GET publics non
signés** : il suffit de passer l'adresse `account` ; aucune clé requise. Réponses mappées
camelCase. Nécessite `init()` (voir [Markets & Spot](./02-markets-spot.md)).

## Compte

| Fonction | Endpoint | Retour |
|---|---|---|
| `getAccountInfo({ account })` | `GET /account` | `AccountInfo` |
| `getAccountSettings({ account })` | `GET /account/settings` | `AccountSettings` |
| `getAccountLoan({ account })` | `GET /account/loan` | `AccountLoan` |
| `getPositions({ account })` | `GET /positions` | `Position[]` |

## Historiques (paginés sauf indication)

| Fonction | Endpoint | Retour |
|---|---|---|
| `getTradeHistory({ account, symbol?, startTime?, endTime?, limit?, cursor? })` | `GET /trades/history` | `Paginated<TradeHistoryEntry>` |
| `getFundingHistory({ account, limit?, cursor? })` | `GET /funding/history` | `Paginated<AccountFundingEntry>` |
| `getPortfolio({ account, timeRange, startTime?, endTime?, limit? })` | `GET /portfolio` | `PortfolioPoint[]` |
| `getBalanceHistory({ account, limit?, cursor? })` | `GET /account/balance/history` | `Paginated<BalanceHistoryEntry>` |
| `getSpotBalanceHistory({ account, symbol?, limit?, cursor? })` | `GET /account/spot_balance/history` | `Paginated<SpotBalanceHistoryEntry>` |
| `getSpotDepositHistory({ account, limit?, cursor? })` | `GET /account/spot_asset/deposit/history` | `Paginated<SpotDepositEntry>` |
| `getSpotWithdrawalHistory({ account, limit?, cursor? })` | `GET /account/spot_asset/withdraw/history` | `Paginated<SpotWithdrawalEntry>` |
| `getPendingSpotWithdrawals({ account })` | `GET /account/spot_asset/withdraw/pending` | `PendingSpotWithdrawal[]` |

`getPortfolio` est l'« account equity history » de la doc. `timeRange` : `PortfolioTimeRange`
(`1d`, `7d`, `14d`, `30d`, `all`).

## Ordres (lecture)

| Fonction | Endpoint | Retour |
|---|---|---|
| `getOpenOrders({ account })` | `GET /orders` | `Order[]` |
| `getOrderHistory({ account, limit?, cursor? })` | `GET /orders/history` | `Paginated<OrderHistoryEntry>` |
| `getOrderHistoryById({ orderId })` | `GET /orders/history_by_id` | `OrderHistoryByIdEntry[]` |

Enums associés : `OrderType`, `OrderStatus`, `OrderCancelReason`, `OrderHistoryEventType`.

## TWAP (lecture) — ⚠️ forme de réponse non confirmée

| Fonction | Endpoint | Retour |
|---|---|---|
| `getOpenTwapOrder({ account })` | `GET /orders/twap` | `JsonObject[]` |
| `getTwapOrderHistory({ account, limit?, cursor? })` | `GET /orders/twap/history` | `Paginated<JsonObject>` |
| `getTwapOrderHistoryById({ orderId })` | `GET /orders/twap/history_by_id` | `JsonObject[]` |

Ces endpoints **ne sont pas documentés** sur gitbook (source : SDK Python) et renvoient un
tableau vide sur le compte testnet de test. La forme exacte d'une entrée TWAP n'a donc pas pu
être vérifiée : les entrées sont typées `JsonObject` (volontairement, sans inventer de champs).
À typer précisément une fois un ordre TWAP réel observé.

## Cas limites

- `AccountInfo.crossAccountEquity` peut être `null`.
- `AccountSettings` : les marchés en réglages par défaut (cross + levier max) ne sont pas
  retournés (`marginSettings` vide pour eux) ; `autoLendDisabled = null` signifie défaut.
- `Position.liquidationPrice` peut être `null` ; `margin` n'est significatif qu'en isolated.
- `Order.clientOrderId` / `stopPrice` / `stopParentOrderId` peuvent être `null`.
