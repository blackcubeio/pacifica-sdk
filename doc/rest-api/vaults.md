# REST API — Vaults (Lakes)

Vault (lake) management: LP and manager. `getVaults` is public (optional `label`); everything else
is signed (mandatory `label`).

Authority: 🔓 **Public** for `getVaults`; every signed function below is 🔑 **Account key or API key**
(the account's own key, or a bound API key for that account).

| Function | signature type | Endpoint | Returns |
|---|---|---|---|
| `getVaults(label?)` | — (public GET) | `GET /lake/list` | `Vault[]` |
| `createVault(params, label)` | `create_lake` | `POST /lake/create` | `CreateVaultResult` |
| `vaultDeposit({ lake, amount, idempotencyKey? }, label)` | `deposit_to_lake` | `POST /lake/deposit` | `void` |
| `vaultWithdraw({ lake, shares, idempotencyKey? }, label)` | `withdraw_from_lake` | `POST /lake/withdraw` | `void` |
| `claimReferralCode({ lake, code }, label)` | `claim_lake_referral` | `POST /lake/claim_referral_code` | `void` |
| `claimManager({ lake, depositAmount }, label)` | `claim_lake_manager` | `POST /lake/claim_manager` | `void` |
| `updateDepositCap({ lake, depositCap }, label)` | `update_lake_deposit_cap` | `POST /lake/update_deposit_cap` | `void` |
| `addToWhitelist({ lake, symbols }, label)` | `add_lake_whitelist` | `POST /lake/add_whitelist` | `void` |
| `removeFromWhitelist({ lake, symbols }, label)` | `remove_lake_whitelist` | `POST /lake/remove_whitelist` | `void` |
| `addToBlacklist({ lake, symbols }, label)` | `add_lake_blacklist` | `POST /lake/add_blacklist` | `void` |
| `removeFromBlacklist({ lake, symbols }, label)` | `remove_lake_blacklist` | `POST /lake/remove_blacklist` | `void` |
| `addMaxLeverage({ lake, symbols, maxLeverage }, label)` | `add_lake_max_leverage` | `POST /lake/add_max_leverage` | `void` |
| `removeMaxLeverage({ lake, symbols }, label)` | `remove_lake_max_leverage` | `POST /lake/remove_max_leverage` | `void` |

### createVault

`{ nickname, initialDeposit, depositCap, depositMinDurationMs, withdrawWindowS,
withdrawDurationS, managerProfitShare, managerMinBalancePortion,
managerLiquidationBalancePortion, referralCode? }` → `{ lakeAddress }`. Minimum initial deposit is 10.

## Notes (real testnet data, measured over 172 lakes)

The `Vault` type is **permissive** because the real response differs from the docs example.
Always present → required: `address, creator, lpShares, managerShares, lpBalance, managerBalance,
lastCheckedEquity, highWatermark, createdAt`. Nullable/optional: `manager`, `nickname`,
`referrer`, `userShare`, `config` (absent on ~10% of lakes) and **all** of `config`'s sub-fields.
`vaultDeposit`: minimum amount is 10.
