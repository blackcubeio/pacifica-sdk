// ── Interfaces COMPLÉMENTAIRES Pacifica (hors contrat commun aux DEX) ────────────
// Pacifica expose beaucoup plus que le tronc commun. Ces interfaces décrivent ces capacités
// **spécifiques**, accessibles via le namespace uniforme `dex.native.<capacité>(label?)`
// (convention partagée par les 4 SDK). Le namespace native **miroite** le commun : `native.perp()`
// (reads marché + ordres avancés, miroir de `perp()`) et `native.account()` (ex-portfolio, miroir de
// `account()`) ; + capacités propres `vaults`/`agents`/`apiKeys`/`wallet`/`lending`/`subAccounts`/`ws`.
// Lectures **get-préfixées**, écritures = verbes nus, entrées en `…Params`.

import type {
  AccountFundingEntry,
  AccountSettings,
  BalanceHistoryEntry,
  BatchAction,
  CancelAllOrdersRef,
  CancelOrderRef,
  CreateLimitOrderParams,
  CreateMarketOrderParams,
  EditOrderRef,
  FeeLevel,
  PortfolioPoint,
  TriggerPriceType,
} from '../common/native';
import type { Candle, JsonValue, Order, Side, UserTrade } from '../common/types';
import type { StreamHandler, Unsubscribe } from '../common/ws';
import type { Twap } from '../converters/twap';
import type { createApiConfigKey } from '../rest/account/create-api-config-key';
import type { createSubaccount } from '../rest/account/create-subaccount';
import type { getAccountLoan } from '../rest/account/get-account-loan';
import type { getPendingSpotWithdrawals } from '../rest/account/get-pending-spot-withdrawals';
import type { getSpotBalanceHistory } from '../rest/account/get-spot-balance-history';
import type { getSpotDepositHistory } from '../rest/account/get-spot-deposit-history';
import type { getSpotWithdrawalHistory } from '../rest/account/get-spot-withdrawal-history';
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
import type { getLoanPool } from '../rest/markets/get-loan-pool';
import type { cancelStopOrder } from '../rest/orders/cancel-stop-order';
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
// account (ex-portfolio) — vocabulaire commun (`name` au lieu de `symbol`)
/** Entrée `updateSettings` — réglages spot d'une paire (vocabulaire commun). */
export interface UpdateSettingsParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Exclure cette paire de la marge unifiée. */
  unifiedMarginExcluded: boolean;
}
// subAccounts (`CreateSubAccountParams` partagé inter-SDK)
export type CreateSubAccountParams = Args<typeof createSubaccount>;
// orders (`PlaceBatchParams` partagé HL/Aster ; entrées en **vocabulaire commun**)

/** Config d'un trigger (stop / TP / SL) en vocabulaire commun (prix = chaînes décimales). */
export interface TriggerConfig {
  /** Prix de déclenchement (chaîne décimale). */
  stopPrice: string;
  /** Prix limite ; absent ⇒ ordre marché au déclenchement. */
  limitPrice?: string;
  /** Client order id. */
  clientId?: string;
  /** Référence du prix de déclenchement (mark/last/mid). */
  triggerPriceType?: TriggerPriceType;
}

/** Entrée `placeStop` — stop d'ouverture/fermeture, vocabulaire commun (`name`/`side`). */
export interface PlaceStopParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Sens. */
  side: Side;
  /** Reduce-only. */
  reduceOnly: boolean;
  /** Prix de déclenchement (chaîne décimale). */
  stopPrice: string;
  /** Prix limite ; absent ⇒ stop **marché**. */
  limitPrice?: string;
  /** Quantité (chaîne décimale) ; absente ⇒ taille de la position. */
  size?: string;
  /** Client order id. */
  clientId?: string;
  /** Référence du prix de déclenchement. */
  triggerPriceType?: TriggerPriceType;
  /** Code builder (fee-sharing) éventuel. */
  builderCode?: string;
}

/** Entrée `cancelStop` — référence d'un stop par `id` (ou `clientId`), vocabulaire commun. */
export interface CancelStopParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** ID d'ordre exchange (l'un de `id`/`clientId` requis). */
  id?: string;
  /** Client order id. */
  clientId?: string;
}

/** Entrée `placeTpsl` — TP/SL de **position**, vocabulaire commun (`name`/`side`). */
export interface PlaceTpslParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Sens de la position visée. */
  side: Side;
  /** Take-profit (déclenchement + limite éventuelle). */
  takeProfit?: TriggerConfig;
  /** Stop-loss (déclenchement + limite éventuelle). */
  stopLoss?: TriggerConfig;
}

/**
 * Entrée `placeBatch` — lot d'**actions** Pacifica (créations/annulations/édition/TP-SL mêlées).
 * Le lot natif est hétérogène (cf. {@link gaps}) : on garde la forme `BatchAction[]` documentée,
 * la **sortie** est normalisée en `Order[]` (un par leg créateur).
 */
export type PlaceBatchParams = BatchAction[];

/** Entrée `getById` — référence d'un ordre par `id`. */
export interface OrderByIdParams {
  /** ID d'ordre exchange. */
  id: string;
}

/** Entrée `getTwapHistoryById` — référence d'un TWAP par `id`. */
export interface TwapByIdParams {
  /** ID du TWAP exchange. */
  id: string;
}

/** Entrée `getMarkPriceCandles` — vocabulaire commun (`name`, bornes datetime `YYYY-MM-DD HH:MM:SS`). */
export interface MarkPriceCandlesParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Intervalle (`1m`, `1h`, `1d`…). */
  interval: string;
  /** Début (datetime `YYYY-MM-DD HH:MM:SS` UTC). */
  startTime?: string;
  /** Fin (datetime `YYYY-MM-DD HH:MM:SS` UTC). */
  endTime?: string;
}

/** Entrée — bornes datetime (`YYYY-MM-DD HH:MM:SS` UTC) + pagination des lectures de compte. */
export interface AccountHistoryParams {
  /** Filtre optionnel sur une paire (= `Pair.name`). */
  name?: string;
  /** Début (datetime `YYYY-MM-DD HH:MM:SS` UTC). */
  startTime?: string;
  /** Fin (datetime `YYYY-MM-DD HH:MM:SS` UTC). */
  endTime?: string;
  /** Nombre max d'éléments. */
  limit?: number;
  /** Curseur de pagination. */
  cursor?: string;
}

/** Plage de temps d'un portefeuille (`getPortfolio`). */
export type PortfolioRange = '1d' | '7d' | '14d' | '30d' | 'all';

/** Entrée `getPortfolio` — plage + bornes datetime optionnelles (`user` injecté par le scope). */
export interface PortfolioParams {
  /** Plage agrégée. */
  timeRange: PortfolioRange;
  /** Début (datetime `YYYY-MM-DD HH:MM:SS` UTC). */
  startTime?: string;
  /** Fin (datetime `YYYY-MM-DD HH:MM:SS` UTC). */
  endTime?: string;
  /** Nombre max de points. */
  limit?: number;
}

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
 * L'adresse du compte (`user`) est **injectée par le scope** (signer) — aucune entrée `account`.
 * Entrées : vocabulaire commun (`name`, bornes datetime `YYYY-MM-DD HH:MM:SS`). Sorties typées :
 * `getTradeHistory` réutilise le commun `UserTrade` ; les autres ont des interfaces dédiées nommées.
 * Lectures get-préfixées ; `updateSettings` nu.
 */
export interface INativeAccount {
  /** Courbe de portefeuille (équity/PnL agrégés) → `PortfolioPoint[]`. */
  getPortfolio(params: PortfolioParams): Promise<PortfolioPoint[]>;
  /** Réglages de compte (marge/spot par paire) → `AccountSettings`. */
  getSettings(): Promise<AccountSettings>;
  /** Met à jour les réglages spot d'une paire (vocab commun). */
  updateSettings(params: UpdateSettingsParams): ReturnType<typeof updateSpotSettings>;
  /** Historique de solde (events) → `BalanceHistoryEntry[]`. */
  getBalanceHistory(params?: AccountHistoryParams): Promise<BalanceHistoryEntry[]>;
  /** Historique d'exécutions du compte → `UserTrade[]` (type **commun**). */
  getTradeHistory(params?: AccountHistoryParams): Promise<UserTrade[]>;
  /** Paiements de funding du compte → `AccountFundingEntry[]` (≠ taux public `getFundingHistory`). */
  getFunding(params?: AccountHistoryParams): Promise<AccountFundingEntry[]>;
}

/**
 * Création de sous-comptes (la liste est dans `account().getSubAccounts`). Les **transferts**
 * master↔sous-compte sont sur le scope commun `transfers()`.
 */
export interface ISubAccountsAdmin {
  create(params: CreateSubAccountParams): ReturnType<typeof createSubaccount>;
}

/**
 * Surplus **perp** Pacifica spécifique, accès `dex.native.perp(label?)` (miroir natif de `dex.perp()`,
 * Pacifica est perp-only) : lectures marché supplémentaires (publiques) **+** ordres avancés (stop,
 * TP/SL de position, batch, lecture par id, TWAP). Hors contrat portable.
 */
export interface INativePerp {
  // ── lectures marché supplémentaires (publiques ; I/O normalisés) ──
  /** Barème de frais par niveau → `FeeLevel[]` (interface dédiée, pas d'équivalent commun). */
  getFeeLevels(): Promise<FeeLevel[]>;
  /** Bougies de **mark price** (fenêtre datetime `YYYY-MM-DD HH:MM:SS`) → `Candle[]` (type commun). */
  getMarkPriceCandles(params: MarkPriceCandlesParams): Promise<Candle[]>;
  // ── ordres avancés (signés ; entrées vocab commun, sorties types communs) ──
  /** Lot d'actions (hétérogène) → `Order[]` (un par leg créateur). */
  placeBatch(actions: PlaceBatchParams): Promise<Order[]>;
  /** Stop d'ouverture/fermeture → `Order` (type commun). */
  placeStop(params: PlaceStopParams): Promise<Order>;
  /** Annule un stop par `id`/`clientId`. */
  cancelStop(params: CancelStopParams): ReturnType<typeof cancelStopOrder>;
  /** Pose un TP/SL de **position**. */
  placeTpsl(params: PlaceTpslParams): ReturnType<typeof createPositionTpsl>;
  /** État courant d'un ordre par `id` → `Order` (type commun). */
  getById(params: OrderByIdParams): Promise<Order>;
  /** TWAP **ouverts** du compte → `Twap[]` (interface dédiée, noms communs). */
  getTwaps(): Promise<Twap[]>;
  /** Historique des TWAP du compte → `Twap[]`. */
  getTwapHistory(params?: AccountHistoryParams): Promise<Twap[]>;
  /** Historique d'un TWAP par `id` → `Twap[]`. */
  getTwapHistoryById(params: TwapByIdParams): Promise<Twap[]>;
}
