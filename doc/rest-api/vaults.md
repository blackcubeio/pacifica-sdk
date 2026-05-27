# REST API — Vaults (Lakes)

Gestion des vaults (lakes) : LP et manager. `getVaults` est public ; le reste est signé (`signer?`).

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `getVaults()` | — (GET public) | `GET /lake/list` | `Vault[]` |
| `createVault(params, signer?)` | `create_lake` | `POST /lake/create` | `CreateVaultResult` |
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
managerLiquidationBalancePortion, referralCode? }` → `{ lakeAddress }`. Dépôt initial **min 10**.

## Notes (réalité testnet, mesurée sur 172 lakes)

Le type `Vault` est **permissif** car la réponse réelle diffère de l'exemple doc. Toujours
présents → requis : `address, creator, lpShares, managerShares, lpBalance, managerBalance,
lastCheckedEquity, highWatermark, createdAt`. Nullable/optionnels : `manager`, `nickname`,
`referrer`, `userShare`, `config` (absent sur ~10% des lakes) et **tous** les sous-champs de
`config`. `vaultDeposit` : montant minimum 10.
