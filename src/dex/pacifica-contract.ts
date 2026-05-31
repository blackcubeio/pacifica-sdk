// ── Interfaces COMPLÉMENTAIRES Pacifica (hors contrat commun aux DEX) ────────────
// Pacifica expose beaucoup plus que le tronc commun. Ces interfaces décrivent ces capacités
// **spécifiques**, accessibles via le namespace uniforme `dex.native.<capacité>(label?)`
// (convention partagée par les 4 SDK) : `native.vaults()`, `native.agents()`, `native.apiKeys()`,
// `native.spot()`, `native.lending()`, `native.portfolio()`, `native.subAccounts()`,
// `native.advancedOrders()`. Noms d'interfaces (`IVaults`, `IAgents`…) **identiques** aux autres
// SDK ; seuls les types de params diffèrent. Les types d'I/O sont dérivés des fonctions REST.

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

/** Gestion des **vaults** (Lake). */
export interface IVaults {
  getVaults(): ReturnType<typeof getVaults>;
  createVault(params: Args<typeof createVault>): ReturnType<typeof createVault>;
  vaultDeposit(params: Args<typeof vaultDeposit>): ReturnType<typeof vaultDeposit>;
  vaultWithdraw(params: Args<typeof vaultWithdraw>): ReturnType<typeof vaultWithdraw>;
  addToWhitelist(params: Args<typeof addToWhitelist>): ReturnType<typeof addToWhitelist>;
  removeFromWhitelist(
    params: Args<typeof removeFromWhitelist>,
  ): ReturnType<typeof removeFromWhitelist>;
  addToBlacklist(params: Args<typeof addToBlacklist>): ReturnType<typeof addToBlacklist>;
  removeFromBlacklist(
    params: Args<typeof removeFromBlacklist>,
  ): ReturnType<typeof removeFromBlacklist>;
  addMaxLeverage(params: Args<typeof addMaxLeverage>): ReturnType<typeof addMaxLeverage>;
  removeMaxLeverage(params: Args<typeof removeMaxLeverage>): ReturnType<typeof removeMaxLeverage>;
  updateDepositCap(params: Args<typeof updateDepositCap>): ReturnType<typeof updateDepositCap>;
  claimManager(params: Args<typeof claimManager>): ReturnType<typeof claimManager>;
  claimReferralCode(params: Args<typeof claimReferralCode>): ReturnType<typeof claimReferralCode>;
}

/** Agent wallets et IP whitelist. Verbes alignés sur les autres SDK (`list`/`approve`/`revoke`). */
export interface IAgents {
  approve(params: Args<typeof bindAgentWallet>): ReturnType<typeof bindAgentWallet>;
  list(): ReturnType<typeof listAgentWallets>;
  revoke(params: Args<typeof revokeAgentWallet>): ReturnType<typeof revokeAgentWallet>;
  revokeAll(): ReturnType<typeof revokeAllAgentWallets>;
  addIp(params: Args<typeof addAgentWhitelistedIp>): ReturnType<typeof addAgentWhitelistedIp>;
  removeIp(
    params: Args<typeof removeAgentWhitelistedIp>,
  ): ReturnType<typeof removeAgentWhitelistedIp>;
  listIps(params: Args<typeof listAgentIpWhitelist>): ReturnType<typeof listAgentIpWhitelist>;
  setIpEnabled(
    params: Args<typeof setAgentIpWhitelistEnabled>,
  ): ReturnType<typeof setAgentIpWhitelistEnabled>;
}

/** Clés de configuration API (rate-limit). Verbes alignés (`create`/`list`/`revoke`). */
export interface IApiKeys {
  create(): ReturnType<typeof createApiConfigKey>;
  list(): ReturnType<typeof listApiConfigKeys>;
  revoke(params: Args<typeof revokeApiConfigKey>): ReturnType<typeof revokeApiConfigKey>;
}

/** Actifs spot, bridge, retraits/transferts spot, historiques spot. */
export interface ISpot {
  getSpotAssets(query?: Args<typeof getSpotAssets>): ReturnType<typeof getSpotAssets>;
  getBridgeInfo(): ReturnType<typeof getBridgeInfo>;
  getBridgeParams(params: Args<typeof getBridgeParams>): ReturnType<typeof getBridgeParams>;
  withdrawSpotAsset(params: Args<typeof withdrawSpotAsset>): ReturnType<typeof withdrawSpotAsset>;
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
  subaccountSpotTransfer(
    params: Args<typeof subaccountSpotTransfer>,
  ): ReturnType<typeof subaccountSpotTransfer>;
}

/** Prêt / auto-lending (Lake collatéral). */
export interface ILending {
  toggleAutoLending(params: Args<typeof toggleAutoLending>): ReturnType<typeof toggleAutoLending>;
  getAccountLoan(params: Args<typeof getAccountLoan>): ReturnType<typeof getAccountLoan>;
  getLoanPool(): ReturnType<typeof getLoanPool>;
}

/** Portefeuille, réglages, historiques de compte. */
export interface IPortfolio {
  getPortfolio(params: Args<typeof getPortfolio>): ReturnType<typeof getPortfolio>;
  getAccountSettings(
    params: Args<typeof getAccountSettings>,
  ): ReturnType<typeof getAccountSettings>;
  updateSpotSettings(
    params: Args<typeof updateSpotSettings>,
  ): ReturnType<typeof updateSpotSettings>;
  getBalanceHistory(params: Args<typeof getBalanceHistory>): ReturnType<typeof getBalanceHistory>;
  getTradeHistory(params: Args<typeof getTradeHistory>): ReturnType<typeof getTradeHistory>;
  getAccountFunding(params: Args<typeof getAccountFunding>): ReturnType<typeof getAccountFunding>;
}

/** Création / transferts de sous-comptes (la liste est dans `account().getSubAccounts`).
 *  Verbes alignés (`create`/`transfer`). */
export interface ISubAccountsAdmin {
  create(params: Args<typeof createSubaccount>): ReturnType<typeof createSubaccount>;
  transfer(params: Args<typeof transferSubaccountFund>): ReturnType<typeof transferSubaccountFund>;
}

/** Ordres avancés : stop, TP/SL de position, batch, TWAP, et données marché annexes. */
export interface IAdvancedOrders {
  createStopOrder(params: Args<typeof createStopOrder>): ReturnType<typeof createStopOrder>;
  cancelStopOrder(params: Args<typeof cancelStopOrder>): ReturnType<typeof cancelStopOrder>;
  createPositionTpsl(
    params: Args<typeof createPositionTpsl>,
  ): ReturnType<typeof createPositionTpsl>;
  placeBatch(actions: Args<typeof batchOrders>): ReturnType<typeof batchOrders>;
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
