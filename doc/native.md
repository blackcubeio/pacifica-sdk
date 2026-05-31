# Surface `native` — spécifique à `@blackcube/pacifica-sdk`

Capacités **propres à Pacifica**, hors contrat unifié (voir [`common.md`](common.md) pour le portable).
Accès uniforme à tous les SDK : **`dex.native.<capacité>(label?)`**. Les noms d'interfaces (`IVaults`,
`IAgents`, `IApiKeys`…) et de méthodes sont **identiques entre SDK** ; seuls les types de params
diffèrent (dérivés des fonctions REST, zéro divergence).

```ts
const dex = new Pacifica({ desk: signer }, { default: 'desk' });
dex.native.vaults().getVaults();
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
| Méthode | Entrée | Sortie |
|---|---|---|
| `getPortfolio(q)` | `PortfolioQuery` | `Promise<Portfolio>` |
| `getSettings(q)` | `AccountQuery` | `Promise<AccountSettings>` |
| `updateSettings(p)` | `UpdateSettingsParams` | `Promise<CodeMsg>` |
| `getBalanceHistory(q)` / `getTradeHistory(q)` / `getFunding(q)` | `…Query` | `Promise<…[]>` |

```ts
await dex.native.account().getPortfolio({ account: '…' });
await dex.native.account().getSettings({ account: '…' });
await dex.native.account().updateSettings({ /* UpdateSettingsParams */ });
await dex.native.account().getTradeHistory({ limit: 100 });
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

## Surplus ordres + marché — portés par `perp()`

> Pas de scope `native` dédié : le surplus **ordres** (`INativeOrders`) et les **lectures marché**
> supplémentaires (`INativeMarket`) sont exposés sur le scope marché `dex.perp()` (Pacifica est
> perp-only), aux côtés des verbes communs (`place`/`cancel`/`edit`…).

| Méthode | Entrée | Sortie |
|---|---|---|
| `placeStop(p)` | `CreateStopOrder` | `Promise<CodeMsg>` |
| `cancelStop(p)` | `CancelStopOrder` | `Promise<CodeMsg>` |
| `placeTpsl(p)` | `CreatePositionTpsl` | `Promise<CodeMsg>` |
| `placeBatch(actions)` | `BatchAction[]` | `Promise<CodeMsg>` (aligné HL/Aster) |
| `getById(q)` | `OrderHistoryByIdQuery` | `Promise<Order>` |
| `getTwaps(q)` / `getTwapHistory(q)` / `getTwapHistoryById(q)` | `…Query` | `Promise<…>` |
| `getFeeLevels()` | — | `Promise<FeeLevel[]>` (marché) |
| `getMarkPriceCandles(q)` | `CandleQuery` | `Promise<Candle[]>` (marché) |

```ts
await dex.perp().placeStop({ symbol: 'BTC', side: 'sell', stopPrice: '50000', size: '0.01' });
await dex.perp().placeTpsl({ symbol: 'BTC', takeProfit: '70000', stopLoss: '50000' });
await dex.perp().placeBatch([{ /* BatchAction */ }]);
await dex.perp().getFeeLevels();
await dex.perp().getMarkPriceCandles({ symbol: 'BTC', interval: '1h' });
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
