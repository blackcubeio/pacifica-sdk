# REST API — Account

Account reads (public GET, `account` as query param) and signed account writes.

## Read (GET, unsigned)

| Function | Endpoint | Returns |
|---|---|---|
| `getAccountInfo({ account })` | `GET /account` | `AccountInfo` |
| `getAccountSettings({ account })` | `GET /account/settings` | `AccountSettings` |
| `getAccountLoan({ account })` | `GET /account/loan` | `AccountLoan` |
| `getPositions({ account })` | `GET /positions` | `Position[]` |
| `getTradeHistory({ account, symbol?, startTime?, endTime?, limit?, cursor? })` | `GET /trades/history` | `Paginated<TradeHistoryEntry>` |
| `getFundingHistory({ account, limit?, cursor? })` | `GET /funding/history` | `Paginated<AccountFundingEntry>` |
| `getPortfolio({ account, timeRange, startTime?, endTime?, limit? })` | `GET /portfolio` | `PortfolioPoint[]` |
| `getBalanceHistory({ account, limit?, cursor? })` | `GET /account/balance/history` | `Paginated<BalanceHistoryEntry>` |
| `getSpotBalanceHistory({ account, symbol?, limit?, cursor? })` | `GET /account/spot_balance/history` | `Paginated<SpotBalanceHistoryEntry>` |
| `getSpotDepositHistory({ account, limit?, cursor? })` | `GET /account/spot_asset/deposit/history` | `Paginated<SpotDepositEntry>` |
| `getSpotWithdrawalHistory({ account, limit?, cursor? })` | `GET /account/spot_asset/withdraw/history` | `Paginated<SpotWithdrawalEntry>` |
| `getPendingSpotWithdrawals({ account })` | `GET /account/spot_asset/withdraw/pending` | `PendingSpotWithdrawal[]` |

`getPortfolio` is the docs' "account equity history" (`timeRange`: `PortfolioTimeRange`).

## Writes (signed — `signer?`)

| Function | signature type | Endpoint | Returns |
|---|---|---|---|
| `updateLeverage({ symbol, leverage })` | `update_leverage` | `POST /account/leverage` | `void` |
| `updateMarginMode({ symbol, isIsolated })` | `update_margin_mode` | `POST /account/margin` | `void` |
| `addIsolatedMargin({ symbol, amount })` | `add_isolated_margin` | `POST /positions/add_isolated_margin` | `void` |
| `toggleAutoLending({ disabled })` | `set_auto_lend_disabled` | `POST /account/settings/auto_lend_disabled` | `void` |
| `updateSpotSettings({ symbol, unifiedMarginExcluded })` | `update_account_spot_settings` | `POST /account/settings/spot` | `void` |
| `withdraw({ amount })` | `withdraw` | `POST /account/withdraw` | `void` |
| `withdrawSpotAsset({ symbol, amount, idempotencyKey? })` | `withdraw_spot_asset` | `POST /account/spot_asset/withdraw` | `WithdrawSpotResult` |

`toggleAutoLending`: `disabled` = `true` (disable) / `false` (enable) / `null` (default).

## Edge cases

- `AccountInfo.crossAccountEquity` may be `null`.
- `AccountSettings`: markets left at default (cross + max leverage) are not returned;
  `autoLendDisabled = null` means default.
- `Position.liquidationPrice` may be `null`; `margin` is only meaningful for isolated positions.
- Collateral deposit is **not** an API route → see [Deposit (on-chain)](../deposit.md).
