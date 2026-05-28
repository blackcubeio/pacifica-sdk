# REST API — Account

Account reads (public GET, `account` as query param) and signed account writes.

## Read (GET, unsigned)

Authority: 🔓 **Public** — no signer, `account` is just a query param. A trailing `label?` selects
the network (no label → mainnet).

| Function | Endpoint | Returns |
|---|---|---|
| `getAccountInfo({ account }, label?)` | `GET /account` | `AccountInfo` |
| `getAccountSettings({ account }, label?)` | `GET /account/settings` | `AccountSettings` |
| `getAccountLoan({ account }, label?)` | `GET /account/loan` | `AccountLoan` |
| `getPositions({ account }, label?)` | `GET /positions` | `Position[]` |
| `getTradeHistory({ account, symbol?, startTime?, endTime?, limit?, cursor? }, label?)` | `GET /trades/history` | `Paginated<TradeHistoryEntry>` |
| `getFundingHistory({ account, limit?, cursor? }, label?)` | `GET /funding/history` | `Paginated<AccountFundingEntry>` |
| `getPortfolio({ account, timeRange, startTime?, endTime?, limit? }, label?)` | `GET /portfolio` | `PortfolioPoint[]` |
| `getBalanceHistory({ account, limit?, cursor? }, label?)` | `GET /account/balance/history` | `Paginated<BalanceHistoryEntry>` |
| `getSpotBalanceHistory({ account, symbol?, limit?, cursor? }, label?)` | `GET /account/spot_balance/history` | `Paginated<SpotBalanceHistoryEntry>` |
| `getSpotDepositHistory({ account, limit?, cursor? }, label?)` | `GET /account/spot_asset/deposit/history` | `Paginated<SpotDepositEntry>` |
| `getSpotWithdrawalHistory({ account, limit?, cursor? }, label?)` | `GET /account/spot_asset/withdraw/history` | `Paginated<SpotWithdrawalEntry>` |
| `getPendingSpotWithdrawals({ account }, label?)` | `GET /account/spot_asset/withdraw/pending` | `PendingSpotWithdrawal[]` |

`getPortfolio` is the docs' "account equity history" (`timeRange`: `PortfolioTimeRange`).

## Writes (signed — mandatory `label` per call)

Authority: 🔑 **Account key or API key** — the account's own key, or a bound API key for that
account. Verified on testnet: `updateLeverage` and `withdraw` both work signed with an API key.

| Function | signature type | Endpoint | Returns |
|---|---|---|---|
| `updateLeverage({ symbol, leverage }, label)` | `update_leverage` | `POST /account/leverage` | `void` |
| `updateMarginMode({ symbol, isIsolated }, label)` | `update_margin_mode` | `POST /account/margin` | `void` |
| `addIsolatedMargin({ symbol, amount }, label)` | `add_isolated_margin` | `POST /positions/add_isolated_margin` | `void` |
| `toggleAutoLending({ disabled }, label)` | `set_auto_lend_disabled` | `POST /account/settings/auto_lend_disabled` | `void` |
| `updateSpotSettings({ symbol, unifiedMarginExcluded }, label)` | `update_account_spot_settings` | `POST /account/settings/spot` | `void` |
| `withdraw({ amount }, label)` | `withdraw` | `POST /account/withdraw` | `void` |
| `withdrawSpotAsset({ symbol, amount, idempotencyKey? }, label)` | `withdraw_spot_asset` | `POST /account/spot_asset/withdraw` | `WithdrawSpotResult` |

`toggleAutoLending`: `disabled` = `true` (disable) / `false` (enable) / `null` (default).

## Edge cases

- `AccountInfo.crossAccountEquity` may be `null`.
- `AccountSettings`: markets left at default (cross + max leverage) are not returned;
  `autoLendDisabled = null` means default.
- `Position.liquidationPrice` may be `null`; `margin` is only meaningful for isolated positions.
- Collateral deposit is **not** an API route → see [Deposit (on-chain)](../deposit.md).
