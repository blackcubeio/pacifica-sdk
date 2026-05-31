# Surface `native` — spécifique à `@blackcube/pacifica-sdk`

Capacités **propres à Pacifica**, hors contrat unifié (voir [`common.md`](common.md) pour le portable).
Accès **`dex.native.<capacité>(label?)`**. Le namespace `native` **miroite** le commun :

| commun (portable) | natif (spécifique) |
|---|---|
| `dex.perp()` | `dex.native.perp()` — reads marché + ordres avancés (stop/tpsl/twap/batch) |
| `dex.account()` | `dex.native.account()` — réglages + historiques (ex-`portfolio`) |
| `dex.transfers()` | — (narrowé `to:{subAccount}`) |

Capacités **sans équivalent commun** : `native.vaults()`, `native.agents()`, `native.apiKeys()`,
`native.wallet()` (spot/bridge), `native.lending()`, `native.subAccounts()`, `native.ws()`.

```ts
const dex = new Pacifica({ desk: signer }, { default: 'desk' });
dex.native.perp().getFeeLevels();
```

`label?` choisit le signer (défaut : signer par défaut). Lectures privées comprises (compte signé).

---

## `native.vaults()` — `IVaults` (vaults Lake)
| Méthode | Entrée | Sortie |
|---|---|---|
| `getVaults()` | — | `Promise<Vault[]>` |
| `create(p)` | `CreateVaultParams` | `Promise<CodeMsg>` |
| `deposit(p)` | `VaultDepositParams` | `Promise<CodeMsg>` |
| `withdraw(p)` | `VaultWithdrawParams` | `Promise<CodeMsg>` |
| `addToWhitelist(p)` / `removeFromWhitelist(p)` | `AddVaultWhitelistParams` / `RemoveVaultWhitelistParams` | `Promise<CodeMsg>` |
| `addToBlacklist(p)` / `removeFromBlacklist(p)` | `AddVaultBlacklistParams` / `RemoveVaultBlacklistParams` | `Promise<CodeMsg>` |
| `addMaxLeverage(p)` / `removeMaxLeverage(p)` | `AddVaultMaxLeverageParams` / `RemoveVaultMaxLeverageParams` | `Promise<CodeMsg>` |
| `updateDepositCap(p)` | `UpdateVaultDepositCapParams` | `Promise<CodeMsg>` |
| `claimManager(p)` / `claimReferralCode(p)` | `ClaimVaultManagerParams` / `ClaimReferralCodeParams` | `Promise<CodeMsg>` |

```ts
await dex.native.vaults().getVaults();
await dex.native.vaults().create({ name: 'My Vault', symbol: 'MV' /* CreateVaultParams */ });
await dex.native.vaults().deposit({ vault: '…', amount: '100' });
await dex.native.vaults().withdraw({ vault: '…', amount: '50' });
await dex.native.vaults().addToWhitelist({ vault: '…', address: '…' });
await dex.native.vaults().updateDepositCap({ vault: '…', cap: '100000' });
await dex.native.vaults().claimManager({ vault: '…' });
```

## `native.agents()` — `IAgents` (agent wallets + IP whitelist)
*(verbes nus `approve`/`revoke` ; lectures get-préfixées.)*
| Méthode | Entrée | Sortie |
|---|---|---|
| `approve(p)` | `ApproveAgentParams` | `Promise<CodeMsg>` |
| `getAgents()` | — | `Promise<AgentWallet[]>` |
| `revoke(p)` | `RevokeAgentParams` | `Promise<CodeMsg>` |
| `revokeAll()` | — | `Promise<CodeMsg>` |
| `addIp(p)` / `removeIp(p)` | `AddAgentIpParams` / `RemoveAgentIpParams` | `Promise<CodeMsg>` |
| `getIpWhitelist(p)` | `ListAgentIpWhitelistParams` | `Promise<string[]>` |
| `setIpEnabled(p)` | `SetAgentIpEnabledParams` | `Promise<CodeMsg>` |

```ts
await dex.native.agents().approve({ agentWallet: '…' });
await dex.native.agents().getAgents();
await dex.native.agents().revoke({ agentWallet: '…' });
await dex.native.agents().revokeAll();
await dex.native.agents().addIp({ ip: '1.2.3.4' });
await dex.native.agents().setIpEnabled({ enabled: true });
```

## `native.apiKeys()` — `IApiKeys` (clés de config API / rate-limit)
*(verbes nus `create`/`revoke` ; lecture get-préfixée.)*
| Méthode | Entrée | Sortie |
|---|---|---|
| `create()` | — | `Promise<ApiConfigKey>` |
| `getApiKeys()` | — | `Promise<ApiConfigKey[]>` |
| `revoke(p)` | `RevokeApiKeyParams` | `Promise<CodeMsg>` |

```ts
await dex.native.apiKeys().create();
await dex.native.apiKeys().getApiKeys();
await dex.native.apiKeys().revoke({ apiKey: '…' });
```

## `native.wallet()` — `IWallet` (ex-`spot` : actifs spot, bridge, retraits, historiques)
*(les **transferts** vers sous-compte sont sur le scope commun `transfers()`.)*
| Méthode | Entrée | Sortie |
|---|---|---|
| `getAssets(q?)` | `SpotAssetsParams?` | `Promise<SpotAsset[]>` |
| `getBridge()` | — | `Promise<BridgeInfo>` |
| `getBridgeParams(q)` | `BridgeParams` | `Promise<…>` |
| `withdraw(p)` | `WithdrawSpotParams` | `Promise<CodeMsg>` |
| `getDepositHistory(p)` / `getWithdrawalHistory(p)` / `getBalanceHistory(p)` | `…Params` | `Promise<…[]>` |
| `getPendingWithdrawals(p)` | `…Params` | `Promise<…[]>` |

```ts
await dex.native.wallet().getAssets();
await dex.native.wallet().getBridge();
await dex.native.wallet().getBridgeParams({ chain: 'solana' });
await dex.native.wallet().withdraw({ asset: 'USDC', amount: '100', destination: '…' });
await dex.native.wallet().getDepositHistory({ limit: 50 });
// Transfert vers sous-compte : dex.transfers().transfer({ to: { subAccount: '…' }, asset: 'SOL', amount: '1' })
```

## `native.lending()` — `ILending` (prêt / auto-lending Lake)
| Méthode | Entrée | Sortie |
|---|---|---|
| `toggleAutoLending(p)` | `ToggleAutoLendingParams` | `Promise<CodeMsg>` |
| `getAccountLoan(q)` | `AccountQuery` | `Promise<AccountLoan>` |
| `getLoanPool()` | — | `Promise<LoanPool>` |

```ts
await dex.native.lending().toggleAutoLending({ enabled: true });
await dex.native.lending().getAccountLoan({ account: '…' });
await dex.native.lending().getLoanPool();
```

## `native.account()` — `INativeAccount` (ex-`portfolio` : portefeuille, réglages, historiques)
**I/O normalisés** : l'adresse du compte (`user`) est **injectée par le scope** (signer) — **aucune
entrée `account`**. Entrées en vocabulaire commun (`name`, dates `YYYY-MM-DD HH:MM:SS` UTC). Sorties
typées : `getTradeHistory` **réutilise le commun `UserTrade`** ; les autres ont une interface dédiée
nommée (`PortfolioPoint`/`AccountSettings`/`BalanceHistoryEntry`/`AccountFundingEntry`).

| Méthode | Entrée | Sortie |
|---|---|---|
| `getPortfolio(p)` | `PortfolioParams` `{ timeRange; startTime?; endTime?; limit? }` | `Promise<PortfolioPoint[]>` |
| `getSettings()` | — | `Promise<AccountSettings>` |
| `updateSettings(p)` | `UpdateSettingsParams` `{ name; unifiedMarginExcluded }` | `Promise<void>` |
| `getBalanceHistory(p?)` | `AccountHistoryParams?` | `Promise<BalanceHistoryEntry[]>` |
| `getTradeHistory(p?)` | `AccountHistoryParams?` `{ name?; startTime?; endTime?; limit?; cursor? }` | `Promise<UserTrade[]>` |
| `getFunding(p?)` | `AccountHistoryParams?` | `Promise<AccountFundingEntry[]>` |

```ts
await dex.native.account().getPortfolio({ timeRange: '7d' });
await dex.native.account().getSettings();
await dex.native.account().updateSettings({ name: 'BTC', unifiedMarginExcluded: true });
await dex.native.account().getTradeHistory({ name: 'BTC', limit: 100 }); // → UserTrade[]
await dex.native.account().getFunding({ limit: 50 });
```

## `native.subAccounts()` — `ISubAccountsAdmin` (création)
*(la **liste** est dans `account().getSubAccounts()` ; les **transferts** sont sur `transfers()`.)*
| Méthode | Entrée | Sortie |
|---|---|---|
| `create(p)` | `CreateSubAccountParams` | `Promise<CodeMsg>` |

```ts
await dex.native.subAccounts().create({ /* CreateSubAccountParams */ });
// Transfert master↔sous-compte : dex.transfers().transfer({ to: { subAccount: '…' }, amount: '100' })
```

## `native.perp()` — `INativePerp` (miroir natif de `perp()`)
Surplus **perp** (Pacifica est perp-only) : lectures marché supplémentaires (publiques) **+** ordres
avancés (stop / TP-SL / batch / TWAP). Hors contrat portable, contrairement à `dex.perp().place()`.

**I/O normalisés** comme le commun : entrées en **vocabulaire commun** (`name`, `side:'buy'|'sell'`,
prix/tailles = chaînes décimales, dates `YYYY-MM-DD HH:MM:SS` UTC) ; sorties **typées** via
convertisseurs (réutilise `Candle`/`Order` communs ; `FeeLevel`/`Twap` = interfaces dédiées nommées
aux noms communs). L'adresse du compte (TWAP) est **injectée par le scope** (signer).

| Méthode | Entrée | Sortie |
|---|---|---|
| `getFeeLevels()` | — | `Promise<FeeLevel[]>` |
| `getMarkPriceCandles(p)` | `MarkPriceCandlesParams` `{ name; interval; startTime?; endTime? }` | `Promise<Candle[]>` |
| `placeStop(p)` | `PlaceStopParams` `{ name; side; reduceOnly; stopPrice; limitPrice?; size?; clientId? }` | `Promise<Order>` |
| `cancelStop(p)` | `CancelStopParams` `{ name; id?; clientId? }` | `Promise<void>` |
| `placeTpsl(p)` | `PlaceTpslParams` `{ name; side; takeProfit?; stopLoss? }` (`TriggerConfig`) | `Promise<void>` |
| `placeBatch(actions)` | `PlaceBatchParams` (= `BatchAction[]`) | `Promise<Order[]>` (1 par leg créateur) |
| `getById(p)` | `OrderByIdParams` `{ id }` | `Promise<Order>` |
| `getTwaps()` | — | `Promise<Twap[]>` |
| `getTwapHistory(p?)` | `AccountHistoryParams?` `{ limit?; cursor? }` | `Promise<Twap[]>` |
| `getTwapHistoryById(p)` | `TwapByIdParams` `{ id }` | `Promise<Twap[]>` |

```ts
await dex.native.perp().getFeeLevels();
await dex.native.perp().getMarkPriceCandles({ name: 'BTC', interval: '1h', startTime: '2026-05-01 00:00:00' });
const stop = await dex.native.perp().placeStop({ name: 'BTC', side: 'sell', reduceOnly: true, stopPrice: '50000', size: '0.01' });
await dex.native.perp().placeTpsl({ name: 'BTC', side: 'buy', takeProfit: { stopPrice: '70000' }, stopLoss: { stopPrice: '50000' } });
const orders = await dex.native.perp().placeBatch([{ type: 'Create', params: { /* CreateLimitOrderParams */ } }]);
const order = await dex.native.perp().getById({ id: '12345' });
await dex.native.perp().getTwaps();
```

### Types — sorties dédiées du `native.perp()`
```ts
// pas d'équivalent commun → interfaces dédiées nommées, mêmes noms que le commun
interface FeeLevel { level: number; makerFeeRate: string; takerFeeRate: string }
interface Twap { name: string; id: string; clientId: string | null; side: 'buy' | 'sell';
  size: string; filled: string; reduceOnly: boolean | null; time: number; xtras?: Record<string, unknown> }
```

## `native.ws()` — `INativeRealtime` (temps réel natif : flux compte bruts + trading via WS)
*(charge **native brute** non couverte par le scope unifié `ws()` ; un seul socket ref-compté.)*
| Méthode | Entrée | Sortie |
|---|---|---|
| `subscribeAccountInfo(cb, account?)` | handler brut | `Unsubscribe` |
| `subscribeAccountMargin(cb, account?)` | handler brut | `Unsubscribe` |
| `subscribeAccountLeverage(cb, account?)` | handler brut | `Unsubscribe` |
| `subscribeAccountTransfers(cb, account?)` | handler brut | `Unsubscribe` |
| `subscribeAccountTwapOrders(cb, account?)` | handler brut | `Unsubscribe` |
| `placeLimit(p)` / `placeMarket(p)` | `Create…OrderParams` | `Promise<JsonValue>` |
| `cancel(p)` / `cancelAll(p)` / `edit(p)` | `…Ref` | `Promise<JsonValue>` |
| `batch(actions)` | `BatchAction[]` | `Promise<JsonValue>` |

```ts
const off = dex.native.ws().subscribeAccountTransfers((msg) => console.log('transfer', msg));
await dex.native.ws().placeLimit({ symbol: 'BTC', side: 'bid', price: '30000', amount: '0.001', tif: 'ALO' });
await dex.native.ws().cancelAll({ symbol: 'BTC' });
off();
```
