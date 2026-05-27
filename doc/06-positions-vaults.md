# Positions TP/SL + Vaults — écritures signées

TP/SL de position et gestion des vaults (Lakes). Écritures signées (`signer?`), sauf
`getVaults` (GET public).

## Position TP/SL

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `createPositionTpsl({ symbol, side, takeProfit?, stopLoss? }, signer?)` | `set_position_tpsl` | `POST /positions/tpsl` | `void` |

`takeProfit` / `stopLoss` = `StopConfig` (`{ stopPrice, limitPrice?, clientOrderId?, triggerPriceType? }`).
Disponible aussi dans le batch (`BatchActionType.SetPositionTpsl`, voir [Orders write](./04-orders-write.md)).

## Vaults (Lakes)

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `getVaults()` | — (GET public) | `GET /lake/list` | `Vault[]` |
| `createVault(params, signer?)` | `create_lake` | `POST /lake/create` | `CreateVaultResult` (`{ lakeAddress }`) |
| `vaultDeposit({ lake, amount, idempotencyKey? }, signer?)` | `deposit_to_lake` | `POST /lake/deposit` | `void` |
| `vaultWithdraw({ lake, shares, idempotencyKey? }, signer?)` | `withdraw_from_lake` | `POST /lake/withdraw` | `void` |
| `claimReferralCode({ lake, code }, signer?)` | `claim_lake_referral` | `POST /lake/claim_referral_code` | `void` |
| `claimManager({ lake, depositAmount }, signer?)` | `claim_lake_manager` | `POST /lake/claim_manager` | `void` |
| `updateDepositCap({ lake, depositCap }, signer?)` | `update_lake_deposit_cap` | `POST /lake/update_deposit_cap` | `void` |
| `addToWhitelist({ lake, symbols }, signer?)` | `add_lake_whitelist` | `POST /lake/add_whitelist` | `void` |
| `removeFromWhitelist({ lake, symbols }, signer?)` | `remove_lake_whitelist` | `POST /lake/remove_whitelist` | `void` |
| `addToBlacklist({ lake, symbols }, signer?)` | `add_lake_blacklist` | `POST /lake/add_blacklist` | `void` |
| `removeFromBlacklist({ lake, symbols }, signer?)` | `remove_lake_blacklist` | `POST /lake/remove_blacklist` | `void` |
| `addMaxLeverage({ lake, symbols, maxLeverage }, signer?)` | `add_lake_max_leverage` | `POST /lake/add_max_leverage` | `void` |
| `removeMaxLeverage({ lake, symbols }, signer?)` | `remove_lake_max_leverage` | `POST /lake/remove_max_leverage` | `void` |

### createVault

`{ nickname, initialDeposit, depositCap, depositMinDurationMs, withdrawWindowS,
withdrawDurationS, managerProfitShare, managerMinBalancePortion,
managerLiquidationBalancePortion, referralCode? }`. Dépôt initial **minimum 10**.

## Cas limites / observations testnet

- **`Vault` est typé d'après la réalité testnet, pas l'exemple doc** (mesuré sur 172 lakes) :
  la doc est plus optimiste que les données réelles. Toujours présents (172/172) → requis :
  `address, creator, lpShares, managerShares, lpBalance, managerBalance, lastCheckedEquity,
  highWatermark, createdAt`. Nullable/optionnels (gaps réels) : `manager` (12 null),
  `nickname` (6 null), `referrer` (présent 4/172), `userShare` (absent du listing), `config`
  (absent 17/172) et **tous** les sous-champs de `config` (ex. `withdrawWindowS` 4/155,
  `depositMinDurationMs` 52/155). Mapping défensif (`?? null`).
- `vaultDeposit` : montant **minimum 10**.
- `createVault` vérifié en réel sur testnet (retourne `lakeAddress`). `vaultDeposit` vérifié réel.
  Les ops manager (updateDepositCap, whitelist…) et `createPositionTpsl` sont validées au niveau
  signature (requête acceptée par l'API ; l'exécution dépend du rôle manager / d'une position ouverte).
