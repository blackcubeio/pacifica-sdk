import { type InitOptions, type PacificaClient, init } from '../common/config';
import type {
  Balance,
  Candle,
  FundingRate,
  MarketKind,
  Order,
  OrderBook,
  Pair,
  Position,
  Price,
  Signer,
  SubAccount,
  Trade,
  UserTrade,
} from '../common/types';
import { dateToMs, keyTypeOf, signEd25519, solanaAddress } from '../common/utils';
import type { StreamHandler } from '../common/ws';
import { addIsolatedMargin } from '../rest/account/add-isolated-margin';
// ── Fonctions surplus Pacifica (exposées via interfaces complémentaires) ──
import { createApiConfigKey } from '../rest/account/create-api-config-key';
import { createSubaccount } from '../rest/account/create-subaccount';
import { getAccountInfo } from '../rest/account/get-account-info';
import { getAccountLoan } from '../rest/account/get-account-loan';
import { getAccountSettings } from '../rest/account/get-account-settings';
import { getBalanceHistory } from '../rest/account/get-balance-history';
import { getAccountFunding } from '../rest/account/get-funding-history';
import { getPendingSpotWithdrawals } from '../rest/account/get-pending-spot-withdrawals';
import { getPortfolio } from '../rest/account/get-portfolio';
import { getSpotBalanceHistory } from '../rest/account/get-spot-balance-history';
import { getSpotDepositHistory } from '../rest/account/get-spot-deposit-history';
import { getSpotWithdrawalHistory } from '../rest/account/get-spot-withdrawal-history';
import { getTradeHistory } from '../rest/account/get-trade-history';
import { listApiConfigKeys } from '../rest/account/list-api-config-keys';
import { getSubAccounts } from '../rest/account/list-subaccounts';
import { revokeApiConfigKey } from '../rest/account/revoke-api-config-key';
import { subaccountSpotTransfer } from '../rest/account/subaccount-spot-transfer';
import { toggleAutoLending } from '../rest/account/toggle-auto-lending';
import { transferSubaccountFund } from '../rest/account/transfer-subaccount-fund';
import { updateSpotSettings } from '../rest/account/update-spot-settings';
import { withdraw } from '../rest/account/withdraw';
import { withdrawSpotAsset } from '../rest/account/withdraw-spot-asset';
import { addAgentWhitelistedIp } from '../rest/agent/add-agent-whitelisted-ip';
import { bindAgentWallet } from '../rest/agent/bind-agent-wallet';
import { listAgentIpWhitelist } from '../rest/agent/list-agent-ip-whitelist';
import { listAgentWallets } from '../rest/agent/list-agent-wallets';
import { removeAgentWhitelistedIp } from '../rest/agent/remove-agent-whitelisted-ip';
import { revokeAgentWallet } from '../rest/agent/revoke-agent-wallet';
import { revokeAllAgentWallets } from '../rest/agent/revoke-all-agent-wallets';
import { setAgentIpWhitelistEnabled } from '../rest/agent/set-agent-ip-whitelist-enabled';
import { cancelAllOrders } from '../rest/cancel-all-orders';
import { cancelOrder } from '../rest/cancel-order';
import { editOrder } from '../rest/edit-order';
import { getBalances } from '../rest/get-balances';
import { getCandles } from '../rest/get-candles';
import { getFundingHistory } from '../rest/get-funding-history';
import { getOpenOrders } from '../rest/get-open-orders';
import { getOrderBook } from '../rest/get-order-book';
import { getOrderHistory } from '../rest/get-order-history';
import { getPairs } from '../rest/get-pairs';
import { getPositions } from '../rest/get-positions';
import { getPrices } from '../rest/get-prices';
import { getTrades } from '../rest/get-trades';
import { getUserTrades } from '../rest/get-user-trades';
import { getFeeLevels } from '../rest/markets/get-fee-levels';
import { getLoanPool } from '../rest/markets/get-loan-pool';
import { getMarkPriceCandleData } from '../rest/markets/get-mark-price-candle-data';
import { getMarketInfo } from '../rest/markets/get-market-info';
import { batchOrders } from '../rest/orders/batch-order';
import { cancelStopOrder } from '../rest/orders/cancel-stop-order';
import { createStopOrder } from '../rest/orders/create-stop-order';
import { getOrderHistoryById } from '../rest/orders/get-order-history-by-id';
import { getOpenTwapOrder } from '../rest/orders/twap/get-open-twap-order';
import { getTwapOrderHistory } from '../rest/orders/twap/get-twap-order-history';
import { getTwapOrderHistoryById } from '../rest/orders/twap/get-twap-order-history-by-id';
import { placeOrder } from '../rest/place-order';
import { createPositionTpsl } from '../rest/positions/create-position-tpsl';
import { getBridgeInfo } from '../rest/spot/get-bridge-info';
import { getBridgeParams } from '../rest/spot/get-bridge-params';
import { getSpotAssets } from '../rest/spot/get-spot-assets';
import { updateLeverage } from '../rest/update-leverage';
import { updateMarginMode } from '../rest/update-margin-mode';
import { addMaxLeverage } from '../rest/vaults/add-max-leverage';
import { addToBlacklist } from '../rest/vaults/add-to-blacklist';
import { addToWhitelist } from '../rest/vaults/add-to-whitelist';
import { claimManager } from '../rest/vaults/claim-manager';
import { claimReferralCode } from '../rest/vaults/claim-referral-code';
import { createVault } from '../rest/vaults/create-vault';
import { getVaults } from '../rest/vaults/get-vaults';
import { removeFromBlacklist } from '../rest/vaults/remove-from-blacklist';
import { removeFromWhitelist } from '../rest/vaults/remove-from-whitelist';
import { removeMaxLeverage } from '../rest/vaults/remove-max-leverage';
import { updateDepositCap } from '../rest/vaults/update-deposit-cap';
import { vaultDeposit } from '../rest/vaults/vault-deposit';
import { vaultWithdraw } from '../rest/vaults/vault-withdraw';
import { UnifiedWsClient } from '../ws/unified-client';
import type {
  CancelAllParams,
  CancelOrderParams,
  CandlesParams,
  EditOrderParams,
  FundingParams,
  IAccount,
  IIsolatedMargin,
  IMarginMode,
  IMarketData,
  IMarketMeta,
  IOrderHistory,
  IProductAccount,
  IPublicTrades,
  IRealtime,
  IRealtimePositions,
  ISubAccounts,
  ITrading,
  ITransfers,
  IsolatedMarginParams,
  KeyHelper,
  LeverageParams,
  MarginModeParams,
  OrderBookParams,
  PlaceOrderParams,
  SolanaHelper,
  SymbolParams,
  TradesParams,
  TransferParams,
  WithdrawParams,
} from './contract';
import type {
  IAgents,
  IApiKeys,
  ILending,
  INativeAccount,
  INativeMarket,
  INativeOrders,
  INativeRealtime,
  ISubAccountsAdmin,
  IVaults,
  IWallet,
} from './native-contract';

/** Options de construction d'un {@link Pacifica}. */
export interface PacificaDexOptions extends Omit<InitOptions, 'signers'> {
  /** Label du signer par défaut (sinon le 1er du registre). */
  default?: string;
}

/**
 * Scope **marché perp** lié à un `label`. Pacifica est **perp-only** : pas de scope `spot()`.
 * La classe n'implémente pas `IRemovableMargin` (Pacifica n'a pas de retrait de marge isolée).
 */
class PacificaMarket
  implements
    IMarketData,
    IMarketMeta,
    IPublicTrades,
    IProductAccount,
    IOrderHistory,
    ITrading,
    INativeOrders,
    INativeMarket,
    IMarginMode,
    IIsolatedMargin
{
  constructor(
    private readonly client: PacificaClient,
    private readonly label: string | undefined,
  ) {}

  private signed(): string {
    if (this.label === undefined) {
      throw new Error('Action signée : aucun signer (ajoute des signers ou un défaut).');
    }
    return this.label;
  }

  /** Adresse réelle du compte (requise par Pacifica pour les lectures de compte). */
  private user(): string {
    const signer = this.client.signers[this.signed()];
    if (signer === undefined) {
      throw new Error(`Aucun signer enregistré sous "${this.label}".`);
    }
    return signer.publicKey;
  }

  // ── IMarketData ──
  public getPairs(): Promise<Pair[]> {
    return getPairs(this.client, this.label);
  }
  public getCandles(query: CandlesParams): Promise<Candle[]> {
    return getCandles(
      this.client,
      {
        name: query.name,
        interval: query.interval,
        startTime: query.startTime === undefined ? 0 : dateToMs(query.startTime),
        endTime: query.endTime === undefined ? undefined : dateToMs(query.endTime),
        limit: query.limit,
      },
      this.label,
    );
  }
  public getOrderBook(query: OrderBookParams): Promise<OrderBook> {
    return getOrderBook(this.client, { name: query.name, limit: query.limit }, this.label);
  }
  public getPrices(): Promise<Price[]> {
    return getPrices(this.client, this.label);
  }
  public getFundingHistory(query: FundingParams): Promise<FundingRate[]> {
    return getFundingHistory(this.client, { name: query.name, limit: query.limit }, this.label);
  }

  // ── IMarketMeta ──
  public getExchangeInfo(): Promise<unknown> {
    return getMarketInfo(this.client, this.label);
  }

  // ── IPublicTrades ──
  public getTrades(query: TradesParams): Promise<Trade[]> {
    return getTrades(this.client, { name: query.name, limit: query.limit }, this.label);
  }

  // ── IProductAccount ──
  public getPositions(query?: SymbolParams): Promise<Position[]> {
    return getPositions(this.client, { user: this.user(), name: query?.name }, this.label);
  }
  public getOpens(query?: SymbolParams): Promise<Order[]> {
    return getOpenOrders(this.client, { user: this.user(), name: query?.name }, this.label);
  }
  public getUserTrades(query?: SymbolParams): Promise<UserTrade[]> {
    return getUserTrades(this.client, { user: this.user(), name: query?.name }, this.label);
  }
  public getAccountInfo(): Promise<unknown> {
    return getAccountInfo(this.client, { account: this.user() }, this.label);
  }

  // ── IOrderHistory ──
  public getHistory(query?: SymbolParams): Promise<Order[]> {
    return getOrderHistory(this.client, { user: this.user(), name: query?.name }, this.label);
  }

  // ── ITrading ──
  public place(input: PlaceOrderParams): Promise<Order> {
    if (input.type !== 'limit' && input.type !== 'market') {
      throw new Error(`place (Pacifica) : type "${input.type}" non supporté (limit/market).`);
    }
    return placeOrder(
      this.client,
      {
        name: input.name,
        side: input.side,
        type: input.type,
        size: input.size,
        price: input.price,
        tif: input.tif,
        reduceOnly: input.reduceOnly,
        clientId: input.clientId,
      },
      this.signed(),
    );
  }
  public cancel(input: CancelOrderParams): Promise<void> {
    return cancelOrder(
      this.client,
      { name: input.name, id: input.id, clientId: input.clientId },
      this.signed(),
    );
  }
  public cancelAll(input: CancelAllParams): Promise<{ cancelled: number | null }> {
    return cancelAllOrders(this.client, { name: input.name }, this.signed());
  }
  public edit(input: EditOrderParams): Promise<{ name: string; id: string }> {
    if (input.price === undefined) {
      throw new Error('edit (Pacifica) : `price` est requis.');
    }
    return editOrder(
      this.client,
      {
        name: input.name,
        size: input.size,
        price: input.price,
        id: input.id,
        clientId: input.clientId,
      },
      this.signed(),
    ).then((result) => ({ name: result.name, id: result.id }));
  }
  public updateLeverage(input: LeverageParams): Promise<unknown> {
    return updateLeverage(
      this.client,
      { name: input.name, leverage: input.leverage },
      this.signed(),
    );
  }

  // ── IMarginMode ──
  public setMarginMode(input: MarginModeParams): Promise<void> {
    return updateMarginMode(
      this.client,
      { name: input.name, isolated: input.isolated },
      this.signed(),
    );
  }

  // ── IIsolatedMargin (pas de removeIsolatedMargin côté Pacifica) ──
  public addIsolatedMargin(input: IsolatedMarginParams): Promise<void> {
    return addIsolatedMargin(
      this.client,
      { symbol: input.name, amount: input.amount },
      this.signed(),
    );
  }

  // ── INativeOrders : surplus ordres Pacifica porté par le scope marché ──
  public placeBatch(actions: Parameters<typeof batchOrders>[1]) {
    return batchOrders(this.client, actions, this.signed());
  }
  public placeStop(params: Parameters<typeof createStopOrder>[1]) {
    return createStopOrder(this.client, params, this.signed());
  }
  public cancelStop(params: Parameters<typeof cancelStopOrder>[1]) {
    return cancelStopOrder(this.client, params, this.signed());
  }
  public placeTpsl(params: Parameters<typeof createPositionTpsl>[1]) {
    return createPositionTpsl(this.client, params, this.signed());
  }
  public getById(params: Parameters<typeof getOrderHistoryById>[1]) {
    return getOrderHistoryById(this.client, params, this.label);
  }
  public getTwaps(params: Parameters<typeof getOpenTwapOrder>[1]) {
    return getOpenTwapOrder(this.client, params, this.label);
  }
  public getTwapHistory(params: Parameters<typeof getTwapOrderHistory>[1]) {
    return getTwapOrderHistory(this.client, params, this.label);
  }
  public getTwapHistoryById(params: Parameters<typeof getTwapOrderHistoryById>[1]) {
    return getTwapOrderHistoryById(this.client, params, this.label);
  }

  // ── INativeMarket : lectures marché supplémentaires Pacifica ──
  public getFeeLevels() {
    return getFeeLevels(this.client, this.label);
  }
  public getMarkPriceCandles(params: Parameters<typeof getMarkPriceCandleData>[1]) {
    return getMarkPriceCandleData(this.client, params, this.label);
  }
}

/** Scope **compte transverse** : soldes, sous-comptes, retrait. */
class PacificaAccount implements IAccount, ISubAccounts {
  constructor(
    private readonly client: PacificaClient,
    private readonly label: string | undefined,
  ) {}

  private signed(): string {
    if (this.label === undefined) {
      throw new Error('Action signée : aucun signer (ajoute des signers ou un défaut).');
    }
    return this.label;
  }

  private user(): string {
    const signer = this.client.signers[this.signed()];
    if (signer === undefined) {
      throw new Error(`Aucun signer enregistré sous "${this.label}".`);
    }
    return signer.publicKey;
  }

  public getBalances(): Promise<Balance[]> {
    return getBalances(this.client, { user: this.user() }, this.label);
  }
  public getSubAccounts(): Promise<SubAccount[]> {
    return getSubAccounts(this.client, this.signed());
  }
  public withdraw(input: WithdrawParams): Promise<unknown> {
    return withdraw(this.client, { amount: input.amount }, this.signed());
  }
}

// Pacifica n'expose ni ping ni horloge serveur publics → pas de scope `system()`
// (capacité `ISystem` non implémentée, conforme à la ségrégation par capacité).

/** Helpers crypto Pacifica : **Solana uniquement** (ed25519, pas d'EVM). */
class PacificaHelpers implements KeyHelper, SolanaHelper {
  public keyTypeOf(privateKey: string): 'evm' | 'solana' {
    return keyTypeOf(privateKey);
  }
  public solanaAddress(privateKey: string): string {
    return solanaAddress(privateKey);
  }
  public signEd25519(msg: string, privateKey: string): string {
    return signEd25519(msg, privateKey);
  }
}

/**
 * Scope **temps réel** lié à un `label`. Pacifica a un flux de positions dédié → implémente
 * `IRealtimePositions`. Les flux user-data résolvent le compte depuis le signer.
 */
class PacificaRealtime implements IRealtime, IRealtimePositions {
  constructor(
    private readonly ws: UnifiedWsClient,
    private readonly kind: MarketKind,
  ) {}

  public subscribeCandles(query: { name: string; interval: string }, cb: (c: Candle) => void) {
    return this.ws.subscribeCandles({ ...query, kind: this.kind }, cb);
  }
  public subscribeOrderBook(query: { name: string }, cb: (b: OrderBook) => void) {
    return this.ws.subscribeOrderBook({ ...query, kind: this.kind }, cb);
  }
  public subscribeTrades(query: { name: string }, cb: (t: Trade) => void) {
    return this.ws.subscribeTrades(query, cb);
  }
  public subscribeBbo(query: { name: string }, cb: (b: OrderBook) => void) {
    return this.ws.subscribeBbo({ ...query, kind: this.kind }, cb);
  }
  public subscribePrices(cb: (p: Price[]) => void) {
    return this.ws.subscribePrices(cb);
  }
  public subscribeOrders(cb: (o: Order) => void) {
    return this.ws.subscribeOrders({}, cb);
  }
  public subscribeUserTrades(cb: (t: UserTrade) => void) {
    return this.ws.subscribeUserTrades({}, cb);
  }
  public subscribePositions(cb: (p: Position) => void) {
    return this.ws.subscribePositions({}, cb);
  }
}

/** Scope **temps réel natif** : flux compte bruts + trading via WS — {@link INativeRealtime}. */
class PacificaNativeWs implements INativeRealtime {
  constructor(private readonly ws: UnifiedWsClient) {}

  public subscribeAccountInfo(handler: StreamHandler, account?: string) {
    return this.ws.subscribeAccountInfo(handler, account);
  }
  public subscribeAccountMargin(handler: StreamHandler, account?: string) {
    return this.ws.subscribeAccountMargin(handler, account);
  }
  public subscribeAccountLeverage(handler: StreamHandler, account?: string) {
    return this.ws.subscribeAccountLeverage(handler, account);
  }
  public subscribeAccountTransfers(handler: StreamHandler, account?: string) {
    return this.ws.subscribeAccountTransfers(handler, account);
  }
  public subscribeAccountTwapOrders(handler: StreamHandler, account?: string) {
    return this.ws.subscribeAccountTwapOrders(handler, account);
  }
  public placeLimit(params: Parameters<UnifiedWsClient['createLimitOrder']>[0]) {
    return this.ws.createLimitOrder(params);
  }
  public placeMarket(params: Parameters<UnifiedWsClient['createMarketOrder']>[0]) {
    return this.ws.createMarketOrder(params);
  }
  public cancel(params: Parameters<UnifiedWsClient['cancelOrder']>[0]) {
    return this.ws.cancelOrder(params);
  }
  public cancelAll(params: Parameters<UnifiedWsClient['cancelAllOrders']>[0]) {
    return this.ws.cancelAllOrders(params);
  }
  public edit(params: Parameters<UnifiedWsClient['editOrder']>[0]) {
    return this.ws.editOrder(params);
  }
  public batch(actions: Parameters<UnifiedWsClient['batchOrders']>[0]) {
    return this.ws.batchOrders(actions);
  }
}

/** Base des scopes signés spécifiques Pacifica (résolution du label commune). */
class PacificaScope {
  constructor(
    protected readonly client: PacificaClient,
    protected readonly label: string | undefined,
  ) {}

  protected signed(): string {
    if (this.label === undefined) {
      throw new Error('Action signée : aucun signer (ajoute des signers ou un défaut).');
    }
    return this.label;
  }
}

/** Scope **vaults** (Lake) — interface complémentaire {@link IVaults}. */
class PacificaVaults extends PacificaScope implements IVaults {
  public getVaults() {
    return getVaults(this.client, this.label);
  }
  public create(params: Parameters<typeof createVault>[1]) {
    return createVault(this.client, params, this.signed());
  }
  public deposit(params: Parameters<typeof vaultDeposit>[1]) {
    return vaultDeposit(this.client, params, this.signed());
  }
  public withdraw(params: Parameters<typeof vaultWithdraw>[1]) {
    return vaultWithdraw(this.client, params, this.signed());
  }
  public addToWhitelist(params: Parameters<typeof addToWhitelist>[1]) {
    return addToWhitelist(this.client, params, this.signed());
  }
  public removeFromWhitelist(params: Parameters<typeof removeFromWhitelist>[1]) {
    return removeFromWhitelist(this.client, params, this.signed());
  }
  public addToBlacklist(params: Parameters<typeof addToBlacklist>[1]) {
    return addToBlacklist(this.client, params, this.signed());
  }
  public removeFromBlacklist(params: Parameters<typeof removeFromBlacklist>[1]) {
    return removeFromBlacklist(this.client, params, this.signed());
  }
  public addMaxLeverage(params: Parameters<typeof addMaxLeverage>[1]) {
    return addMaxLeverage(this.client, params, this.signed());
  }
  public removeMaxLeverage(params: Parameters<typeof removeMaxLeverage>[1]) {
    return removeMaxLeverage(this.client, params, this.signed());
  }
  public updateDepositCap(params: Parameters<typeof updateDepositCap>[1]) {
    return updateDepositCap(this.client, params, this.signed());
  }
  public claimManager(params: Parameters<typeof claimManager>[1]) {
    return claimManager(this.client, params, this.signed());
  }
  public claimReferralCode(params: Parameters<typeof claimReferralCode>[1]) {
    return claimReferralCode(this.client, params, this.signed());
  }
}

/** Scope **agent** — interface complémentaire {@link IAgents}. */
class PacificaAgent extends PacificaScope implements IAgents {
  public approve(params: Parameters<typeof bindAgentWallet>[1]) {
    return bindAgentWallet(this.client, params, this.signed());
  }
  public getAgents() {
    return listAgentWallets(this.client, this.signed());
  }
  public revoke(params: Parameters<typeof revokeAgentWallet>[1]) {
    return revokeAgentWallet(this.client, params, this.signed());
  }
  public revokeAll() {
    return revokeAllAgentWallets(this.client, this.signed());
  }
  public addIp(params: Parameters<typeof addAgentWhitelistedIp>[1]) {
    return addAgentWhitelistedIp(this.client, params, this.signed());
  }
  public removeIp(params: Parameters<typeof removeAgentWhitelistedIp>[1]) {
    return removeAgentWhitelistedIp(this.client, params, this.signed());
  }
  public getIpWhitelist(params: Parameters<typeof listAgentIpWhitelist>[1]) {
    return listAgentIpWhitelist(this.client, params, this.signed());
  }
  public setIpEnabled(params: Parameters<typeof setAgentIpWhitelistEnabled>[1]) {
    return setAgentIpWhitelistEnabled(this.client, params, this.signed());
  }
}

/** Scope **apiKeys** (clés de config API) — interface complémentaire {@link IApiKeys}. */
class PacificaApiKeys extends PacificaScope implements IApiKeys {
  public create() {
    return createApiConfigKey(this.client, this.signed());
  }
  public getApiKeys() {
    return listApiConfigKeys(this.client, this.signed());
  }
  public revoke(params: Parameters<typeof revokeApiConfigKey>[1]) {
    return revokeApiConfigKey(this.client, params, this.signed());
  }
}

/** Scope **wallet** (ex-spot : actifs spot, bridge, retraits, historiques) — {@link IWallet}. */
class PacificaWallet extends PacificaScope implements IWallet {
  public getAssets(query?: Parameters<typeof getSpotAssets>[1]) {
    return getSpotAssets(this.client, query ?? {}, this.label);
  }
  public getBridge() {
    return getBridgeInfo(this.client, this.label);
  }
  public getBridgeParams(params: Parameters<typeof getBridgeParams>[1]) {
    return getBridgeParams(this.client, params, this.label);
  }
  public withdraw(params: Parameters<typeof withdrawSpotAsset>[1]) {
    return withdrawSpotAsset(this.client, params, this.signed());
  }
  public getDepositHistory(params: Parameters<typeof getSpotDepositHistory>[1]) {
    return getSpotDepositHistory(this.client, params, this.label);
  }
  public getWithdrawalHistory(params: Parameters<typeof getSpotWithdrawalHistory>[1]) {
    return getSpotWithdrawalHistory(this.client, params, this.label);
  }
  public getBalanceHistory(params: Parameters<typeof getSpotBalanceHistory>[1]) {
    return getSpotBalanceHistory(this.client, params, this.label);
  }
  public getPendingWithdrawals(params: Parameters<typeof getPendingSpotWithdrawals>[1]) {
    return getPendingSpotWithdrawals(this.client, params, this.label);
  }
}

/** Scope **lending** (prêt / auto-lending) — interface complémentaire {@link ILending}. */
class PacificaLending extends PacificaScope implements ILending {
  public toggleAutoLending(params: Parameters<typeof toggleAutoLending>[1]) {
    return toggleAutoLending(this.client, params, this.signed());
  }
  public getAccountLoan(params: Parameters<typeof getAccountLoan>[1]) {
    return getAccountLoan(this.client, params, this.label);
  }
  public getLoanPool() {
    return getLoanPool(this.client, this.label);
  }
}

/** Scope **account** (ex-portfolio : réglages + historiques de compte) — {@link INativeAccount}. */
class PacificaAccountExtra extends PacificaScope implements INativeAccount {
  public getPortfolio(params: Parameters<typeof getPortfolio>[1]) {
    return getPortfolio(this.client, params, this.label);
  }
  public getSettings(params: Parameters<typeof getAccountSettings>[1]) {
    return getAccountSettings(this.client, params, this.label);
  }
  public updateSettings(params: Parameters<typeof updateSpotSettings>[1]) {
    return updateSpotSettings(this.client, params, this.signed());
  }
  public getBalanceHistory(params: Parameters<typeof getBalanceHistory>[1]) {
    return getBalanceHistory(this.client, params, this.label);
  }
  public getTradeHistory(params: Parameters<typeof getTradeHistory>[1]) {
    return getTradeHistory(this.client, params, this.label);
  }
  public getFunding(params: Parameters<typeof getAccountFunding>[1]) {
    return getAccountFunding(this.client, params, this.label);
  }
}

/** Scope **subaccounts** (création ; les transferts sont sur `transfers()`) — {@link ISubAccountsAdmin}. */
class PacificaSubAccounts extends PacificaScope implements ISubAccountsAdmin {
  public create(params: Parameters<typeof createSubaccount>[1]) {
    return createSubaccount(this.client, params);
  }
}

/**
 * Scope **transferts** unifié (commun aux 4 SDK). Route le modèle abstrait
 * `transfer({ from?, to, asset?, amount })` vers les endpoints Pacifica :
 * - `to: { subAccount }` sans `asset` → `transferSubaccountFund` (USDC perp master↔sous-compte) ;
 * - `to: { subAccount }` avec `asset` → `subaccountSpotTransfer` (token spot) ;
 * - `wallet ↔ wallet` / `to: { account }` → non supportés (Pacifica est perp-only, pas d'envoi externe).
 */
class PacificaTransfers extends PacificaScope implements ITransfers {
  public transfer(p: TransferParams) {
    if ('subAccount' in p.to) {
      if (p.asset !== undefined) {
        return subaccountSpotTransfer(
          this.client,
          { toAccount: p.to.subAccount, symbol: p.asset, amount: p.amount },
          this.signed(),
        );
      }
      return transferSubaccountFund(
        this.client,
        { toAccount: p.to.subAccount, amount: p.amount },
        this.signed(),
      );
    }
    throw new Error(
      'transfer : Pacifica supporte uniquement `to: { subAccount }` (USDC perp, ou token spot via `asset`).',
    );
  }
}

/**
 * Façade **Pacifica** : `const dex = new Pacifica({ deskA: signer }, { default: 'deskA' })`, puis
 * `dex.perp(label?)` (marché — Pacifica est perp-only), `dex.account(label?)` (compte),
 * `dex.ws(label?)` (temps réel). `label` absent → signer par défaut.
 *
 * Chaque instance détient son propre {@link PacificaClient} (config isolée) : plusieurs
 * `Pacifica` (comptes/réseaux différents) coexistent sans état global partagé.
 */
export class Pacifica {
  private readonly client: PacificaClient;
  private readonly defaultLabel: string | undefined;
  private wsClients = new Map<string, UnifiedWsClient>();

  constructor(signers: Record<string, Signer> = {}, options: PacificaDexOptions = {}) {
    const { default: defaultLabel, ...init0 } = options;
    this.client = init({ ...init0, signers });
    this.defaultLabel = defaultLabel ?? Object.keys(signers)[0];
  }

  private resolve(label?: string): string | undefined {
    return label ?? this.defaultLabel;
  }

  /** Scope marché **perp** (Pacifica est perp-only : pas de `spot()`). */
  public perp(label?: string): PacificaMarket {
    return new PacificaMarket(this.client, this.resolve(label));
  }

  /** Scope **compte** transverse (soldes, sous-comptes, retrait). */
  public account(label?: string): PacificaAccount {
    return new PacificaAccount(this.client, this.resolve(label));
  }

  /** Scope **transferts** unifié (master↔sous-compte ; USDC perp ou token spot). */
  public transfers(label?: string): PacificaTransfers {
    return new PacificaTransfers(this.client, this.resolve(label));
  }

  /** Helpers crypto (Solana). */
  public helpers(): PacificaHelpers {
    return new PacificaHelpers();
  }

  /** Scope **temps réel** perp. */
  public ws(label?: string): PacificaRealtime {
    return new PacificaRealtime(this.unifiedWs(this.resolve(label)), 'perp');
  }

  // ── Surplus spécifique Pacifica (namespace `native`, convention partagée par les 4 SDK) ──

  /**
   * Capacités **spécifiques à Pacifica**, hors contrat unifié. Accès uniforme à tous les SDK :
   * `dex.native.<capacité>(label?)`. Noms d'interfaces (`IVaults`, `IAgents`…) et de méthodes
   * **identiques** entre SDK ; seuls les types de params diffèrent.
   */
  public get native() {
    const c = this.client;
    const r = (label?: string) => this.resolve(label);
    return {
      /** Vaults (Lake) — `IVaults`. */
      vaults: (label?: string) => new PacificaVaults(c, r(label)),
      /** Agent wallets + IP whitelist — `IAgents`. */
      agents: (label?: string) => new PacificaAgent(c, r(label)),
      /** Clés de config API — `IApiKeys`. */
      apiKeys: (label?: string) => new PacificaApiKeys(c, r(label)),
      /** Portefeuille spot (actifs, bridge, retraits, historiques) — `IWallet`. */
      wallet: (label?: string) => new PacificaWallet(c, r(label)),
      /** Prêt / auto-lending (Lake) — `ILending`. */
      lending: (label?: string) => new PacificaLending(c, r(label)),
      /** Réglages + historiques de compte (ex-portfolio) — `INativeAccount`. */
      account: (label?: string) => new PacificaAccountExtra(c, r(label)),
      /** Création de sous-comptes — `ISubAccountsAdmin`. */
      subAccounts: (label?: string) => new PacificaSubAccounts(c, r(label)),
      /** Temps réel natif : flux compte bruts + trading via WS — `INativeRealtime`. */
      ws: (label?: string) => new PacificaNativeWs(this.unifiedWs(r(label))),
    };
  }

  /** Un client WS unifié par label (réutilisé pour partager le ref-counting du socket). */
  private unifiedWs(label: string | undefined): UnifiedWsClient {
    const key = label ?? '';
    let ws = this.wsClients.get(key);
    if (ws === undefined) {
      ws = new UnifiedWsClient(this.client, label);
      this.wsClients.set(key, ws);
    }
    return ws;
  }
}
