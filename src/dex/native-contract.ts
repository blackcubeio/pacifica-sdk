// ── Interfaces COMPLÉMENTAIRES Pacifica (hors contrat commun aux DEX) ────────────
// Pacifica expose beaucoup plus que le tronc commun. Ces interfaces décrivent ces capacités
// **spécifiques**, accessibles via le namespace uniforme `dex.native.<capacité>(label?)`
// (convention partagée par les 4 SDK) : `native.vaults()`, `native.agents()`, `native.apiKeys()`,
// `native.spot()`, `native.lending()`, `native.portfolio()`, `native.subAccounts()`,
// `native.advancedOrders()`. Noms d'interfaces (`IVaults`, `IAgents`…) **identiques** aux autres
// SDK ; seuls les types de params diffèrent. Les types d'I/O sont dérivés des fonctions REST.

import type {
  BatchAction,
  CancelAllOrdersRef,
  CancelOrderRef,
  CreateLimitOrderParams,
  CreateMarketOrderParams,
  EditOrderRef,
} from '../common/native';
import type { JsonValue } from '../common/types';
import type { StreamHandler, Unsubscribe } from '../common/ws';
import type { createApiConfigKey } from '../rest/account/create-api-config-key';
import type { createSubaccount } from '../rest/account/create-subaccount';
import type { getAccountLoan } from '../rest/account/get-account-loan';
import type { getAccountSettings } from '../rest/account/get-account-settings';
import type { getBalanceHistory } from '../rest/account/get-balance-history';
import type { getAccountFunding } from '../rest/account/get-funding-history';
import type { getPendingSpotWithdrawals } from '../rest/account/get-pending-spot-withdrawals';
import type { getPortfolio } from '../rest/account/get-portfolio';
import type { getSpotBalanceHistory } from '../rest/account/get-spot-balance-history';
import type { getSpotDepositHistory } from '../rest/account/get-spot-deposit-history';
import type { getSpotWithdrawalHistory } from '../rest/account/get-spot-withdrawal-history';
import type { getTradeHistory } from '../rest/account/get-trade-history';
import type { listApiConfigKeys } from '../rest/account/list-api-config-keys';
import type { revokeApiConfigKey } from '../rest/account/revoke-api-config-key';
import type { subaccountSpotTransfer } from '../rest/account/subaccount-spot-transfer';
import type { toggleAutoLending } from '../rest/account/toggle-auto-lending';
import type { transferSubaccountFund } from '../rest/account/transfer-subaccount-fund';
import type { updateSpotSettings } from '../rest/account/update-spot-settings';
import type { withdrawSpotAsset } from '../rest/account/withdraw-spot-asset';
import type { addAgentWhitelistedIp } from '../rest/agent/add-agent-whitelisted-ip';
import type { bindAgentWallet } from '../rest/agent/bind-agent-wallet';
import type { listAgentIpWhitelist } from '../rest/agent/list-agent-ip-whitelist';
import type { listAgentWallets } from '../rest/agent/list-agent-wallets';
import type { removeAgentWhitelistedIp } from '../rest/agent/remove-agent-whitelisted-ip';
import type { revokeAgentWallet } from '../rest/agent/revoke-agent-wallet';
import type { revokeAllAgentWallets } from '../rest/agent/revoke-all-agent-wallets';
import type { setAgentIpWhitelistEnabled } from '../rest/agent/set-agent-ip-whitelist-enabled';
import type { getFeeLevels } from '../rest/markets/get-fee-levels';
import type { getLoanPool } from '../rest/markets/get-loan-pool';
import type { getMarkPriceCandleData } from '../rest/markets/get-mark-price-candle-data';
import type { batchOrders } from '../rest/orders/batch-order';
import type { cancelStopOrder } from '../rest/orders/cancel-stop-order';
import type { createStopOrder } from '../rest/orders/create-stop-order';
import type { getOrderHistoryById } from '../rest/orders/get-order-history-by-id';
import type { getOpenTwapOrder } from '../rest/orders/twap/get-open-twap-order';
import type { getTwapOrderHistory } from '../rest/orders/twap/get-twap-order-history';
import type { getTwapOrderHistoryById } from '../rest/orders/twap/get-twap-order-history-by-id';
import type { createPositionTpsl } from '../rest/positions/create-position-tpsl';
import type { getBridgeInfo } from '../rest/spot/get-bridge-info';
import type { getBridgeParams } from '../rest/spot/get-bridge-params';
import type { getSpotAssets } from '../rest/spot/get-spot-assets';
import type { addMaxLeverage } from '../rest/vaults/add-max-leverage';
import type { addToBlacklist } from '../rest/vaults/add-to-blacklist';
import type { addToWhitelist } from '../rest/vaults/add-to-whitelist';
import type { claimManager } from '../rest/vaults/claim-manager';
import type { claimReferralCode } from '../rest/vaults/claim-referral-code';
import type { createVault } from '../rest/vaults/create-vault';
import type { getVaults } from '../rest/vaults/get-vaults';
import type { removeFromBlacklist } from '../rest/vaults/remove-from-blacklist';
import type { removeFromWhitelist } from '../rest/vaults/remove-from-whitelist';
import type { removeMaxLeverage } from '../rest/vaults/remove-max-leverage';
import type { updateDepositCap } from '../rest/vaults/update-deposit-cap';
import type { vaultDeposit } from '../rest/vaults/vault-deposit';
import type { vaultWithdraw } from '../rest/vaults/vault-withdraw';

/** `params` (2ᵉ arg) d'une fonction REST `fn(client, params, label)`. */
type Args<F extends (...a: never[]) => unknown> = Parameters<F>[1];

// ── Types d'ENTRÉE des ÉCRITURES (noms de concept propres, alignés inter-SDK) ──────────────
// Découplés des noms REST internes : si l'endpoint change, seul le côté droit bouge, le nom public
// reste stable. Les noms partagés (`ApproveAgent`, `RevokeAgent`, `CreateSubAccount`,
// `TransferSubAccount`, `RevokeApiKey`, `PlaceBatch`) sont **identiques** sur les autres SDK qui
// portent le même geste ; les noms spécifiques restent descriptifs (« similaires »). Les lectures
// gardent `Args<typeof fn>` en ligne (un type nommé pour un filtre de lecture n'apporte rien).

// vaults
export type CreateVault = Args<typeof createVault>;
export type VaultDeposit = Args<typeof vaultDeposit>;
export type VaultWithdraw = Args<typeof vaultWithdraw>;
export type AddVaultWhitelist = Args<typeof addToWhitelist>;
export type RemoveVaultWhitelist = Args<typeof removeFromWhitelist>;
export type AddVaultBlacklist = Args<typeof addToBlacklist>;
export type RemoveVaultBlacklist = Args<typeof removeFromBlacklist>;
export type AddVaultMaxLeverage = Args<typeof addMaxLeverage>;
export type RemoveVaultMaxLeverage = Args<typeof removeMaxLeverage>;
export type UpdateVaultDepositCap = Args<typeof updateDepositCap>;
export type ClaimVaultManager = Args<typeof claimManager>;
export type ClaimReferralCode = Args<typeof claimReferralCode>;
// agents (`ApproveAgent`/`RevokeAgent` partagés inter-SDK)
export type ApproveAgent = Args<typeof bindAgentWallet>;
export type RevokeAgent = Args<typeof revokeAgentWallet>;
export type AddAgentIp = Args<typeof addAgentWhitelistedIp>;
export type RemoveAgentIp = Args<typeof removeAgentWhitelistedIp>;
export type SetAgentIpEnabled = Args<typeof setAgentIpWhitelistEnabled>;
// apiKeys (`RevokeApiKey` partagé inter-SDK)
export type RevokeApiKey = Args<typeof revokeApiConfigKey>;
// spot
export type WithdrawSpot = Args<typeof withdrawSpotAsset>;
export type SubAccountSpotTransfer = Args<typeof subaccountSpotTransfer>;
// lending
export type ToggleAutoLending = Args<typeof toggleAutoLending>;
// portfolio
export type UpdateSpotSettings = Args<typeof updateSpotSettings>;
// subAccounts (`CreateSubAccount`/`TransferSubAccount` partagés inter-SDK)
export type CreateSubAccount = Args<typeof createSubaccount>;
export type TransferSubAccount = Args<typeof transferSubaccountFund>;
// advancedOrders (`PlaceBatch` partagé HL/Aster)
export type CreateStopOrder = Args<typeof createStopOrder>;
export type CancelStopOrder = Args<typeof cancelStopOrder>;
export type CreatePositionTpsl = Args<typeof createPositionTpsl>;
export type PlaceBatch = Args<typeof batchOrders>;

/** Temps réel **natif** : flux compte bruts non couverts par `ws()` + trading via WebSocket. */
export interface INativeRealtime {
  subscribeAccountInfo(handler: StreamHandler, account?: string): Unsubscribe;
  subscribeAccountMargin(handler: StreamHandler, account?: string): Unsubscribe;
  subscribeAccountLeverage(handler: StreamHandler, account?: string): Unsubscribe;
  subscribeAccountTransfers(handler: StreamHandler, account?: string): Unsubscribe;
  subscribeAccountTwapOrders(handler: StreamHandler, account?: string): Unsubscribe;
  placeLimit(params: CreateLimitOrderParams): Promise<JsonValue>;
  placeMarket(params: CreateMarketOrderParams): Promise<JsonValue>;
  cancel(params: CancelOrderRef): Promise<JsonValue>;
  cancelAll(params: CancelAllOrdersRef): Promise<JsonValue>;
  edit(params: EditOrderRef): Promise<JsonValue>;
  batch(actions: BatchAction[]): Promise<JsonValue>;
}

/** Gestion des **vaults** (Lake). */
export interface IVaults {
  getVaults(): ReturnType<typeof getVaults>;
  createVault(params: CreateVault): ReturnType<typeof createVault>;
  vaultDeposit(params: VaultDeposit): ReturnType<typeof vaultDeposit>;
  vaultWithdraw(params: VaultWithdraw): ReturnType<typeof vaultWithdraw>;
  addToWhitelist(params: AddVaultWhitelist): ReturnType<typeof addToWhitelist>;
  removeFromWhitelist(params: RemoveVaultWhitelist): ReturnType<typeof removeFromWhitelist>;
  addToBlacklist(params: AddVaultBlacklist): ReturnType<typeof addToBlacklist>;
  removeFromBlacklist(params: RemoveVaultBlacklist): ReturnType<typeof removeFromBlacklist>;
  addMaxLeverage(params: AddVaultMaxLeverage): ReturnType<typeof addMaxLeverage>;
  removeMaxLeverage(params: RemoveVaultMaxLeverage): ReturnType<typeof removeMaxLeverage>;
  updateDepositCap(params: UpdateVaultDepositCap): ReturnType<typeof updateDepositCap>;
  claimManager(params: ClaimVaultManager): ReturnType<typeof claimManager>;
  claimReferralCode(params: ClaimReferralCode): ReturnType<typeof claimReferralCode>;
}

/** Agent wallets et IP whitelist. Verbes alignés sur les autres SDK (`list`/`approve`/`revoke`). */
export interface IAgents {
  approve(params: ApproveAgent): ReturnType<typeof bindAgentWallet>;
  list(): ReturnType<typeof listAgentWallets>;
  revoke(params: RevokeAgent): ReturnType<typeof revokeAgentWallet>;
  revokeAll(): ReturnType<typeof revokeAllAgentWallets>;
  addIp(params: AddAgentIp): ReturnType<typeof addAgentWhitelistedIp>;
  removeIp(params: RemoveAgentIp): ReturnType<typeof removeAgentWhitelistedIp>;
  listIps(params: Args<typeof listAgentIpWhitelist>): ReturnType<typeof listAgentIpWhitelist>;
  setIpEnabled(params: SetAgentIpEnabled): ReturnType<typeof setAgentIpWhitelistEnabled>;
}

/** Clés de configuration API (rate-limit). Verbes alignés (`create`/`list`/`revoke`). */
export interface IApiKeys {
  create(): ReturnType<typeof createApiConfigKey>;
  list(): ReturnType<typeof listApiConfigKeys>;
  revoke(params: RevokeApiKey): ReturnType<typeof revokeApiConfigKey>;
}

/** Actifs spot, bridge, retraits/transferts spot, historiques spot. */
export interface ISpot {
  getSpotAssets(query?: Args<typeof getSpotAssets>): ReturnType<typeof getSpotAssets>;
  getBridgeInfo(): ReturnType<typeof getBridgeInfo>;
  getBridgeParams(params: Args<typeof getBridgeParams>): ReturnType<typeof getBridgeParams>;
  withdrawSpotAsset(params: WithdrawSpot): ReturnType<typeof withdrawSpotAsset>;
  getSpotDepositHistory(
    params: Args<typeof getSpotDepositHistory>,
  ): ReturnType<typeof getSpotDepositHistory>;
  getSpotWithdrawalHistory(
    params: Args<typeof getSpotWithdrawalHistory>,
  ): ReturnType<typeof getSpotWithdrawalHistory>;
  getSpotBalanceHistory(
    params: Args<typeof getSpotBalanceHistory>,
  ): ReturnType<typeof getSpotBalanceHistory>;
  getPendingSpotWithdrawals(
    params: Args<typeof getPendingSpotWithdrawals>,
  ): ReturnType<typeof getPendingSpotWithdrawals>;
  subaccountSpotTransfer(params: SubAccountSpotTransfer): ReturnType<typeof subaccountSpotTransfer>;
}

/** Prêt / auto-lending (Lake collatéral). */
export interface ILending {
  toggleAutoLending(params: ToggleAutoLending): ReturnType<typeof toggleAutoLending>;
  getAccountLoan(params: Args<typeof getAccountLoan>): ReturnType<typeof getAccountLoan>;
  getLoanPool(): ReturnType<typeof getLoanPool>;
}

/** Portefeuille, réglages, historiques de compte. */
export interface IPortfolio {
  getPortfolio(params: Args<typeof getPortfolio>): ReturnType<typeof getPortfolio>;
  getAccountSettings(
    params: Args<typeof getAccountSettings>,
  ): ReturnType<typeof getAccountSettings>;
  updateSpotSettings(params: UpdateSpotSettings): ReturnType<typeof updateSpotSettings>;
  getBalanceHistory(params: Args<typeof getBalanceHistory>): ReturnType<typeof getBalanceHistory>;
  getTradeHistory(params: Args<typeof getTradeHistory>): ReturnType<typeof getTradeHistory>;
  getAccountFunding(params: Args<typeof getAccountFunding>): ReturnType<typeof getAccountFunding>;
}

/** Création / transferts de sous-comptes (la liste est dans `account().getSubAccounts`).
 *  Verbes alignés (`create`/`transfer`). */
export interface ISubAccountsAdmin {
  create(params: CreateSubAccount): ReturnType<typeof createSubaccount>;
  transfer(params: TransferSubAccount): ReturnType<typeof transferSubaccountFund>;
}

/** Ordres avancés : stop, TP/SL de position, batch, TWAP, et données marché annexes. */
export interface IAdvancedOrders {
  createStopOrder(params: CreateStopOrder): ReturnType<typeof createStopOrder>;
  cancelStopOrder(params: CancelStopOrder): ReturnType<typeof cancelStopOrder>;
  createPositionTpsl(params: CreatePositionTpsl): ReturnType<typeof createPositionTpsl>;
  placeBatch(actions: PlaceBatch): ReturnType<typeof batchOrders>;
  getOrderHistoryById(
    params: Args<typeof getOrderHistoryById>,
  ): ReturnType<typeof getOrderHistoryById>;
  getOpenTwapOrder(params: Args<typeof getOpenTwapOrder>): ReturnType<typeof getOpenTwapOrder>;
  getTwapOrderHistory(
    params: Args<typeof getTwapOrderHistory>,
  ): ReturnType<typeof getTwapOrderHistory>;
  getTwapOrderHistoryById(
    params: Args<typeof getTwapOrderHistoryById>,
  ): ReturnType<typeof getTwapOrderHistoryById>;
  getFeeLevels(): ReturnType<typeof getFeeLevels>;
  getMarkPriceCandleData(
    params: Args<typeof getMarkPriceCandleData>,
  ): ReturnType<typeof getMarkPriceCandleData>;
}
