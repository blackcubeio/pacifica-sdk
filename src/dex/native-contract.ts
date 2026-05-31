// ── Interfaces COMPLÉMENTAIRES Pacifica (hors contrat commun aux DEX) ────────────
// Pacifica expose beaucoup plus que le tronc commun. Ces interfaces décrivent ces capacités
// **spécifiques**, accessibles via le namespace uniforme `dex.native.<capacité>(label?)`
// (convention partagée par les 4 SDK) : `native.vaults()`, `native.agents()`, `native.apiKeys()`,
// `native.wallet()` (ex-spot), `native.lending()`, `native.account()` (ex-portfolio),
// `native.subAccounts()`. Lectures **get-préfixées**, écritures = verbes nus, entrées en `…Params`.
// (Le surplus **ordres** + lectures marché sont portés par `perp()` — cf. INativeOrders/INativeMarket.)

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
import type { toggleAutoLending } from '../rest/account/toggle-auto-lending';
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

// ── Types d'ENTRÉE des ÉCRITURES (suffixe `…Params`, noms alignés inter-SDK) ──────────────
// Découplés des noms REST internes. Les noms partagés (`ApproveAgentParams`, `RevokeAgentParams`,
// `CreateSubAccountParams`, `RevokeApiKeyParams`, `PlaceBatchParams`) sont **identiques** sur les
// autres SDK portant le même geste. Les lectures gardent `Args<typeof fn>` en ligne.

// vaults
export type CreateVaultParams = Args<typeof createVault>;
export type VaultDepositParams = Args<typeof vaultDeposit>;
export type VaultWithdrawParams = Args<typeof vaultWithdraw>;
export type AddVaultWhitelistParams = Args<typeof addToWhitelist>;
export type RemoveVaultWhitelistParams = Args<typeof removeFromWhitelist>;
export type AddVaultBlacklistParams = Args<typeof addToBlacklist>;
export type RemoveVaultBlacklistParams = Args<typeof removeFromBlacklist>;
export type AddVaultMaxLeverageParams = Args<typeof addMaxLeverage>;
export type RemoveVaultMaxLeverageParams = Args<typeof removeMaxLeverage>;
export type UpdateVaultDepositCapParams = Args<typeof updateDepositCap>;
export type ClaimVaultManagerParams = Args<typeof claimManager>;
export type ClaimReferralCodeParams = Args<typeof claimReferralCode>;
// agents (`ApproveAgentParams`/`RevokeAgentParams` partagés inter-SDK)
export type ApproveAgentParams = Args<typeof bindAgentWallet>;
export type RevokeAgentParams = Args<typeof revokeAgentWallet>;
export type AddAgentIpParams = Args<typeof addAgentWhitelistedIp>;
export type RemoveAgentIpParams = Args<typeof removeAgentWhitelistedIp>;
export type SetAgentIpEnabledParams = Args<typeof setAgentIpWhitelistEnabled>;
// apiKeys (`RevokeApiKeyParams` partagé inter-SDK)
export type RevokeApiKeyParams = Args<typeof revokeApiConfigKey>;
// wallet (ex-spot)
export type WithdrawSpotParams = Args<typeof withdrawSpotAsset>;
// lending
export type ToggleAutoLendingParams = Args<typeof toggleAutoLending>;
// account (ex-portfolio)
export type UpdateSettingsParams = Args<typeof updateSpotSettings>;
// subAccounts (`CreateSubAccountParams` partagé inter-SDK)
export type CreateSubAccountParams = Args<typeof createSubaccount>;
// orders (`PlaceBatchParams` partagé HL/Aster)
export type PlaceStopParams = Args<typeof createStopOrder>;
export type CancelStopParams = Args<typeof cancelStopOrder>;
export type PlaceTpslParams = Args<typeof createPositionTpsl>;
export type PlaceBatchParams = Args<typeof batchOrders>;

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

/** Gestion des **vaults** (Lake). Verbes nus (`create`/`deposit`/`withdraw`) ; lecture get-préfixée. */
export interface IVaults {
  getVaults(): ReturnType<typeof getVaults>;
  create(params: CreateVaultParams): ReturnType<typeof createVault>;
  deposit(params: VaultDepositParams): ReturnType<typeof vaultDeposit>;
  withdraw(params: VaultWithdrawParams): ReturnType<typeof vaultWithdraw>;
  addToWhitelist(params: AddVaultWhitelistParams): ReturnType<typeof addToWhitelist>;
  removeFromWhitelist(params: RemoveVaultWhitelistParams): ReturnType<typeof removeFromWhitelist>;
  addToBlacklist(params: AddVaultBlacklistParams): ReturnType<typeof addToBlacklist>;
  removeFromBlacklist(params: RemoveVaultBlacklistParams): ReturnType<typeof removeFromBlacklist>;
  addMaxLeverage(params: AddVaultMaxLeverageParams): ReturnType<typeof addMaxLeverage>;
  removeMaxLeverage(params: RemoveVaultMaxLeverageParams): ReturnType<typeof removeMaxLeverage>;
  updateDepositCap(params: UpdateVaultDepositCapParams): ReturnType<typeof updateDepositCap>;
  claimManager(params: ClaimVaultManagerParams): ReturnType<typeof claimManager>;
  claimReferralCode(params: ClaimReferralCodeParams): ReturnType<typeof claimReferralCode>;
}

/** Agent wallets et IP whitelist. Verbes nus (`approve`/`revoke`) ; lectures get-préfixées. */
export interface IAgents {
  approve(params: ApproveAgentParams): ReturnType<typeof bindAgentWallet>;
  getAgents(): ReturnType<typeof listAgentWallets>;
  revoke(params: RevokeAgentParams): ReturnType<typeof revokeAgentWallet>;
  revokeAll(): ReturnType<typeof revokeAllAgentWallets>;
  addIp(params: AddAgentIpParams): ReturnType<typeof addAgentWhitelistedIp>;
  removeIp(params: RemoveAgentIpParams): ReturnType<typeof removeAgentWhitelistedIp>;
  getIpWhitelist(
    params: Args<typeof listAgentIpWhitelist>,
  ): ReturnType<typeof listAgentIpWhitelist>;
  setIpEnabled(params: SetAgentIpEnabledParams): ReturnType<typeof setAgentIpWhitelistEnabled>;
}

/** Clés de configuration API (rate-limit). Verbes nus (`create`/`revoke`) ; lecture get-préfixée. */
export interface IApiKeys {
  create(): ReturnType<typeof createApiConfigKey>;
  getApiKeys(): ReturnType<typeof listApiConfigKeys>;
  revoke(params: RevokeApiKeyParams): ReturnType<typeof revokeApiConfigKey>;
}

/**
 * Portefeuille **spot** (ex-`spot`) : actifs, bridge, retraits, historiques. Lectures get-préfixées,
 * retrait `withdraw` nu. (Les **transferts** vers sous-compte sont sur le scope commun `transfers()`.)
 */
export interface IWallet {
  getAssets(query?: Args<typeof getSpotAssets>): ReturnType<typeof getSpotAssets>;
  getBridge(): ReturnType<typeof getBridgeInfo>;
  getBridgeParams(params: Args<typeof getBridgeParams>): ReturnType<typeof getBridgeParams>;
  withdraw(params: WithdrawSpotParams): ReturnType<typeof withdrawSpotAsset>;
  getDepositHistory(
    params: Args<typeof getSpotDepositHistory>,
  ): ReturnType<typeof getSpotDepositHistory>;
  getWithdrawalHistory(
    params: Args<typeof getSpotWithdrawalHistory>,
  ): ReturnType<typeof getSpotWithdrawalHistory>;
  getBalanceHistory(
    params: Args<typeof getSpotBalanceHistory>,
  ): ReturnType<typeof getSpotBalanceHistory>;
  getPendingWithdrawals(
    params: Args<typeof getPendingSpotWithdrawals>,
  ): ReturnType<typeof getPendingSpotWithdrawals>;
}

/** Prêt / auto-lending (Lake collatéral). Lectures get-préfixées. */
export interface ILending {
  toggleAutoLending(params: ToggleAutoLendingParams): ReturnType<typeof toggleAutoLending>;
  getAccountLoan(params: Args<typeof getAccountLoan>): ReturnType<typeof getAccountLoan>;
  getLoanPool(): ReturnType<typeof getLoanPool>;
}

/**
 * Lectures **et** réglages de compte étendus (ex-`portfolio`), portés par `native.account()`.
 * Lectures get-préfixées ; `updateSettings` nu.
 */
export interface INativeAccount {
  getPortfolio(params: Args<typeof getPortfolio>): ReturnType<typeof getPortfolio>;
  getSettings(params: Args<typeof getAccountSettings>): ReturnType<typeof getAccountSettings>;
  updateSettings(params: UpdateSettingsParams): ReturnType<typeof updateSpotSettings>;
  getBalanceHistory(params: Args<typeof getBalanceHistory>): ReturnType<typeof getBalanceHistory>;
  getTradeHistory(params: Args<typeof getTradeHistory>): ReturnType<typeof getTradeHistory>;
  getFunding(params: Args<typeof getAccountFunding>): ReturnType<typeof getAccountFunding>;
}

/**
 * Création de sous-comptes (la liste est dans `account().getSubAccounts`). Les **transferts**
 * master↔sous-compte sont sur le scope commun `transfers()`.
 */
export interface ISubAccountsAdmin {
  create(params: CreateSubAccountParams): ReturnType<typeof createSubaccount>;
}

/**
 * Surplus **ordres** Pacifica, porté par le scope marché (`perp()`) : stop, TP/SL de position,
 * batch, lecture par id, TWAP. Verbes alignés inter-SDK (`placeStop`/`placeTpsl`/`getById`/`getTwaps`…).
 */
export interface INativeOrders {
  placeBatch(actions: PlaceBatchParams): ReturnType<typeof batchOrders>;
  placeStop(params: PlaceStopParams): ReturnType<typeof createStopOrder>;
  cancelStop(params: CancelStopParams): ReturnType<typeof cancelStopOrder>;
  placeTpsl(params: PlaceTpslParams): ReturnType<typeof createPositionTpsl>;
  getById(params: Args<typeof getOrderHistoryById>): ReturnType<typeof getOrderHistoryById>;
  getTwaps(params: Args<typeof getOpenTwapOrder>): ReturnType<typeof getOpenTwapOrder>;
  getTwapHistory(params: Args<typeof getTwapOrderHistory>): ReturnType<typeof getTwapOrderHistory>;
  getTwapHistoryById(
    params: Args<typeof getTwapOrderHistoryById>,
  ): ReturnType<typeof getTwapOrderHistoryById>;
}

/** Lectures **marché** supplémentaires Pacifica (publiques), portées par le scope marché. */
export interface INativeMarket {
  getFeeLevels(): ReturnType<typeof getFeeLevels>;
  getMarkPriceCandles(
    params: Args<typeof getMarkPriceCandleData>,
  ): ReturnType<typeof getMarkPriceCandleData>;
}
