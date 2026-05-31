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
| `createVault(p)` | `CreateVault` | `Promise<CodeMsg>` |
| `vaultDeposit(p)` | `VaultDeposit` | `Promise<CodeMsg>` |
| `vaultWithdraw(p)` | `VaultWithdraw` | `Promise<CodeMsg>` |
| `addToWhitelist(p)` / `removeFromWhitelist(p)` | `AddVaultWhitelist` / `RemoveVaultWhitelist` | `Promise<CodeMsg>` |
| `addToBlacklist(p)` / `removeFromBlacklist(p)` | `AddVaultBlacklist` / `RemoveVaultBlacklist` | `Promise<CodeMsg>` |
| `addMaxLeverage(p)` / `removeMaxLeverage(p)` | `AddVaultMaxLeverage` / `RemoveVaultMaxLeverage` | `Promise<CodeMsg>` |
| `updateDepositCap(p)` | `UpdateVaultDepositCap` | `Promise<CodeMsg>` |
| `claimManager(p)` / `claimReferralCode(p)` | `ClaimVaultManager` / `ClaimReferralCode` | `Promise<CodeMsg>` |

```ts
await dex.native.vaults().getVaults();
await dex.native.vaults().createVault({ name: 'My Vault', symbol: 'MV' /* CreateVaultParams */ });
await dex.native.vaults().vaultDeposit({ vault: '…', amount: '100' });
await dex.native.vaults().vaultWithdraw({ vault: '…', amount: '50' });
await dex.native.vaults().addToWhitelist({ vault: '…', address: '…' });
await dex.native.vaults().updateDepositCap({ vault: '…', cap: '100000' });
await dex.native.vaults().claimManager({ vault: '…' });
```

## `native.agents()` — `IAgents` (agent wallets + IP whitelist)
*(verbes alignés sur les autres SDK : `list`/`approve`/`revoke`.)*
| Méthode | Entrée | Sortie |
|---|---|---|
| `approve(p)` | `ApproveAgent` | `Promise<CodeMsg>` |
| `list()` | — | `Promise<AgentWallet[]>` |
| `revoke(p)` | `RevokeAgent` | `Promise<CodeMsg>` |
| `revokeAll()` | — | `Promise<CodeMsg>` |
| `addIp(p)` / `removeIp(p)` | `…WhitelistedIpParams` | `Promise<CodeMsg>` |
| `listIps(p)` | `ListAgentIpWhitelistParams` | `Promise<string[]>` |
| `setIpEnabled(p)` | `SetAgentIpEnabled` | `Promise<CodeMsg>` |

```ts
await dex.native.agents().approve({ agentWallet: '…' });
await dex.native.agents().list();
await dex.native.agents().revoke({ agentWallet: '…' });
await dex.native.agents().revokeAll();
await dex.native.agents().addIp({ ip: '1.2.3.4' });
await dex.native.agents().setIpEnabled({ enabled: true });
```

## `native.apiKeys()` — `IApiKeys` (clés de config API / rate-limit)
*(verbes alignés : `create`/`list`/`revoke`.)*
| Méthode | Entrée | Sortie |
|---|---|---|
| `create()` | — | `Promise<ApiConfigKey>` |
| `list()` | — | `Promise<ApiConfigKey[]>` |
| `revoke(p)` | `RevokeApiKey` | `Promise<CodeMsg>` |

```ts
await dex.native.apiKeys().create();
await dex.native.apiKeys().list();
await dex.native.apiKeys().revoke({ apiKey: '…' });
```

## `native.spot()` — `ISpot` (actifs spot, bridge, retraits/transferts spot)
| Méthode | Entrée | Sortie |
|---|---|---|
| `getSpotAssets(q?)` | `SpotAssetsQuery?` | `Promise<SpotAsset[]>` |
| `getBridgeInfo()` | — | `Promise<BridgeInfo>` |
| `getBridgeParams(q)` | `BridgeParamsQuery` | `Promise<BridgeParams>` |
| `withdrawSpotAsset(p)` | `WithdrawSpot` | `Promise<CodeMsg>` |
| `getSpotDepositHistory(p)` / `getSpotWithdrawalHistory(p)` / `getSpotBalanceHistory(p)` | `…HistoryQuery` | `Promise<…[]>` |
| `getPendingSpotWithdrawals(p)` | `PendingSpotWithdrawalsQuery` | `Promise<…[]>` |
| `subaccountSpotTransfer(p)` | `SubAccountSpotTransfer` | `Promise<CodeMsg>` |

```ts
await dex.native.spot().getSpotAssets();
await dex.native.spot().getBridgeInfo();
await dex.native.spot().getBridgeParams({ chain: 'solana' });
await dex.native.spot().withdrawSpotAsset({ asset: 'USDC', amount: '100', destination: '…' });
await dex.native.spot().getSpotDepositHistory({ limit: 50 });
await dex.native.spot().subaccountSpotTransfer({ subaccount: '…', asset: 'USDC', amount: '10' });
```

## `native.lending()` — `ILending` (prêt / auto-lending Lake)
| Méthode | Entrée | Sortie |
|---|---|---|
| `toggleAutoLending(p)` | `ToggleAutoLending` | `Promise<CodeMsg>` |
| `getAccountLoan(q)` | `AccountQuery` | `Promise<AccountLoan>` |
| `getLoanPool()` | — | `Promise<LoanPool>` |

```ts
await dex.native.lending().toggleAutoLending({ enabled: true });
await dex.native.lending().getAccountLoan({ account: '…' });
await dex.native.lending().getLoanPool();
```

## `native.portfolio()` — `IPortfolio` (portefeuille, réglages, historiques)
| Méthode | Entrée | Sortie |
|---|---|---|
| `getPortfolio(q)` | `PortfolioQuery` | `Promise<Portfolio>` |
| `getAccountSettings(q)` | `AccountQuery` | `Promise<AccountSettings>` |
| `updateSpotSettings(p)` | `UpdateSpotSettings` | `Promise<CodeMsg>` |
| `getBalanceHistory(q)` / `getTradeHistory(q)` / `getAccountFunding(q)` | `…Query` | `Promise<…[]>` |

```ts
await dex.native.portfolio().getPortfolio({ account: '…' });
await dex.native.portfolio().getAccountSettings({ account: '…' });
await dex.native.portfolio().updateSpotSettings({ /* UpdateSpotSettingsParams */ });
await dex.native.portfolio().getTradeHistory({ limit: 100 });
await dex.native.portfolio().getAccountFunding({ limit: 50 });
```

## `native.subAccounts()` — `ISubAccountsAdmin` (création / transferts)
*(la **liste** des sous-comptes est dans le scope unifié `account().getSubAccounts()` ; verbes alignés `create`/`transfer`.)*
| Méthode | Entrée | Sortie |
|---|---|---|
| `create(p)` | `CreateSubAccount` | `Promise<CodeMsg>` |
| `transfer(p)` | `TransferSubAccount` | `Promise<CodeMsg>` |

```ts
await dex.native.subAccounts().create({ /* CreateSubaccountParams */ });
await dex.native.subAccounts().transfer({ subaccount: '…', amount: '100', direction: 'in' });
```

## `native.advancedOrders()` — `IAdvancedOrders` (stop, TP/SL, batch, TWAP, marché annexe)
| Méthode | Entrée | Sortie |
|---|---|---|
| `createStopOrder(p)` | `CreateStopOrder` | `Promise<CodeMsg>` |
| `cancelStopOrder(p)` | `CancelStopOrder` | `Promise<CodeMsg>` |
| `createPositionTpsl(p)` | `CreatePositionTpsl` | `Promise<CodeMsg>` |
| `placeBatch(actions)` | `BatchAction[]` | `Promise<CodeMsg>` (aligné HL/Aster) |
| `getOrderHistoryById(q)` | `OrderHistoryByIdQuery` | `Promise<Order>` |
| `getOpenTwapOrder(q)` / `getTwapOrderHistory(q)` / `getTwapOrderHistoryById(q)` | `…Query` | `Promise<…>` |
| `getFeeLevels()` | — | `Promise<FeeLevel[]>` |
| `getMarkPriceCandleData(q)` | `CandleQuery` | `Promise<Candle[]>` |

```ts
await dex.native.advancedOrders().createStopOrder({ symbol: 'BTC', side: 'sell', stopPrice: '50000', size: '0.01' });
await dex.native.advancedOrders().createPositionTpsl({ symbol: 'BTC', takeProfit: '70000', stopLoss: '50000' });
await dex.native.advancedOrders().placeBatch([{ /* BatchAction */ }]);
await dex.native.advancedOrders().getFeeLevels();
await dex.native.advancedOrders().getMarkPriceCandleData({ symbol: 'BTC', interval: '1h' });
```
