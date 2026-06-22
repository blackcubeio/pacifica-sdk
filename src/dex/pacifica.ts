import { type InitOptions, type PacificaClient, init } from '../common/config';
import {
  type AccountFundingEntry,
  type AccountSettings,
  type BalanceHistoryEntry,
  type BatchAction,
  BatchActionType,
  type CancelOrderRef,
  type CandleInterval,
  type CreateLimitOrderParams,
  type CreateMarketOrderParams,
  type EditOrderRef,
  type FeeLevel,
  OrderSide,
  type PortfolioPoint,
  type PortfolioTimeRange,
  type StopConfig,
} from '../common/native';
import { TimeInForce } from '../common/types';
import type {
  Balance,
  Candle,
  FundingRate,
  JsonValue,
  MarketKind,
  Order,
  OrderBook,
  Pair,
  Position,
  Price,
  Side,
  Signer,
  SubAccount,
  Trade,
  UserTrade,
} from '../common/types';
import { dateToMs, keyTypeOf, signEd25519, solanaAddress } from '../common/utils';
import type { StreamHandler } from '../common/ws';
import {
  OrderHistoryByIdConverter,
  batchResultToOrders,
  stopOrderToCommon,
} from '../converters/native-order';
import type { Twap } from '../converters/twap';
import { UserTradeConverter } from '../converters/user-trade';
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
  AccountHistoryParams,
  CancelStopParams,
  IAgents,
  IApiKeys,
  ILending,
  INativeAccount,
  INativePerp,
  INativeRealtime,
  ISubAccountsAdmin,
  IVaults,
  IWallet,
  MarkPriceCandlesParams,
  OrderByIdParams,
  PlaceBatchParams,
  PlaceStopParams,
  PlaceTpslParams,
  PortfolioParams,
  TriggerConfig,
  TwapByIdParams,
  UpdateSettingsParams,
  WsAck,
  WsBatchAction,
  WsCancelAllParams,
  WsCancelParams,
  WsEditParams,
  WsPlaceLimitParams,
  WsPlaceMarketParams,
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
    // Ordre déclenché (stop/take-profit) : même surface commune que les autres SDK. On route vers le stop
    // natif Pacifica (`placeStop` → createStopOrder) ; `price` = prix limite au déclenchement (absent ⇒ stop
    // marché). C6 : la mécanique reste cachée dans la méthode, pas de throw.
    if (input.triggerPrice !== undefined) {
      const triggerPrice = input.triggerPrice;
      const reduceOnly = input.reduceOnly ?? false;
      const side = input.side === 'buy' ? OrderSide.Bid : OrderSide.Ask;
      return createStopOrder(
        this.client,
        {
          symbol: input.name,
          side,
          reduceOnly,
          stopOrder: {
            stopPrice: triggerPrice,
            limitPrice: input.price,
            clientOrderId: input.clientId,
            amount: input.size,
          },
        },
        this.signed(),
      ).then((res) =>
        stopOrderToCommon({
          name: input.name,
          side: input.side,
          reduceOnly,
          stopPrice: triggerPrice,
          limitPrice: input.price,
          size: input.size,
          clientId: input.clientId,
          orderId: res.orderId,
        }),
      );
    }
    // `type` régulier (`limit`/`market`) : `slippagePercent` est forwardé sur le chemin market (sans lui,
    // l'ordre marché était plafonné à 1 % par défaut — argent réel).
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
        slippagePercent: input.slippagePercent,
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
  // Bougies 1m de tout le marché en UNE souscription : on bucketise le flux de prix agrégé (subscribePrices) par
  // symbole. close exact ; OHLC échantillonné ; volume non porté par le flux agrégé → 0. API uniforme sur les DEX.
  public subscribeAllCandles(cb: (c: Candle) => void) {
    const forming = new Map<string, { t: number; o: number; h: number; l: number; c: number }>();
    return this.subscribePrices((prices) => {
      const t = Math.floor(Date.now() / 60_000) * 60_000;
      for (const p of prices) {
        const px = Number(p.mid ?? p.last ?? p.mark ?? p.oracle);
        if (!Number.isFinite(px)) {
          continue;
        }
        let f = forming.get(p.name);
        if (f === undefined || f.t !== t) {
          f = { t, o: px, h: px, l: px, c: px };
          forming.set(p.name, f);
        } else {
          f.h = Math.max(f.h, px);
          f.l = Math.min(f.l, px);
          f.c = px;
        }
        cb({
          t: f.t,
          T: f.t + 60_000,
          s: p.name,
          i: '1m',
          o: String(f.o),
          h: String(f.h),
          l: String(f.l),
          c: String(f.c),
          v: '0',
          n: 0,
          kind: p.kind,
          qv: null,
          tbbv: null,
          tbqv: null,
        });
      }
    });
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
const WS_TIF: Record<'gtc' | 'ioc' | 'fok' | 'alo', TimeInForce> = {
  gtc: TimeInForce.Gtc,
  ioc: TimeInForce.Ioc,
  fok: TimeInForce.Fok,
  alo: TimeInForce.Alo,
};
const wsSide = (side: Side): OrderSide => (side === 'buy' ? OrderSide.Bid : OrderSide.Ask);

/** Réponse WS brute → accusé typé `WsAck` (`ok` dérivé, réponse complète en `xtras`). */
function toAck(res: JsonValue): WsAck {
  const obj = res !== null && typeof res === 'object' ? (res as Record<string, unknown>) : {};
  const ok = !('error' in obj) && obj.success !== false;
  return { ok, xtras: { response: res } };
}
const toLimitNative = (p: WsPlaceLimitParams): CreateLimitOrderParams => ({
  symbol: p.name,
  side: wsSide(p.side),
  amount: p.size,
  price: p.price,
  ...(p.tif !== undefined ? { tif: WS_TIF[p.tif] } : {}),
  ...(p.reduceOnly !== undefined ? { reduceOnly: p.reduceOnly } : {}),
  ...(p.clientId !== undefined ? { clientOrderId: p.clientId } : {}),
});
const toMarketNative = (p: WsPlaceMarketParams): CreateMarketOrderParams => ({
  symbol: p.name,
  side: wsSide(p.side),
  amount: p.size,
  slippagePercent: p.slippagePercent,
  ...(p.reduceOnly !== undefined ? { reduceOnly: p.reduceOnly } : {}),
  ...(p.clientId !== undefined ? { clientOrderId: p.clientId } : {}),
});
const toCancelNative = (p: WsCancelParams): CancelOrderRef => ({
  symbol: p.name,
  ...(p.id !== undefined ? { orderId: Number(p.id) } : {}),
  ...(p.clientId !== undefined ? { clientOrderId: p.clientId } : {}),
});
const toEditNative = (p: WsEditParams): EditOrderRef => ({
  symbol: p.name,
  amount: p.size,
  price: p.price,
  ...(p.id !== undefined ? { orderId: Number(p.id) } : {}),
  ...(p.clientId !== undefined ? { clientOrderId: p.clientId } : {}),
});
function toBatchNative(a: WsBatchAction): BatchAction {
  switch (a.kind) {
    case 'placeLimit':
      return { type: BatchActionType.Create, params: toLimitNative(a.order) };
    case 'placeMarket':
      return { type: BatchActionType.CreateMarket, params: toMarketNative(a.order) };
    case 'cancel':
      return { type: BatchActionType.Cancel, params: toCancelNative(a.ref) };
    case 'edit':
      return { type: BatchActionType.Edit, params: toEditNative(a.edit) };
  }
}

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
  public placeLimit(params: WsPlaceLimitParams): Promise<WsAck> {
    return this.ws.createLimitOrder(toLimitNative(params)).then(toAck);
  }
  public placeMarket(params: WsPlaceMarketParams): Promise<WsAck> {
    return this.ws.createMarketOrder(toMarketNative(params)).then(toAck);
  }
  public cancel(params: WsCancelParams): Promise<WsAck> {
    return this.ws.cancelOrder(toCancelNative(params)).then(toAck);
  }
  public cancelAll(params?: WsCancelAllParams): Promise<WsAck> {
    return this.ws
      .cancelAllOrders({ allSymbols: true, excludeReduceOnly: params?.excludeReduceOnly ?? false })
      .then(toAck);
  }
  public edit(params: WsEditParams): Promise<WsAck> {
    return this.ws.editOrder(toEditNative(params)).then(toAck);
  }
  public batch(actions: WsBatchAction[]): Promise<WsAck> {
    return this.ws.batchOrders(actions.map(toBatchNative)).then(toAck);
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

/**
 * Surplus **perp** Pacifica (miroir natif de `dex.perp()`), accès `dex.native.perp(label?)` :
 * lectures marché supplémentaires (publiques) + ordres avancés (signés). Hors contrat portable.
 */
class PacificaNativePerp extends PacificaScope implements INativePerp {
  /** Adresse du compte (requise par Pacifica pour les lectures par compte). */
  private user(): string {
    const signer = this.client.signers[this.signed()];
    if (signer === undefined) {
      throw new Error(`Aucun signer enregistré sous "${this.label}".`);
    }
    return signer.publicKey;
  }

  private toTrigger(config: TriggerConfig): StopConfig {
    return {
      stopPrice: config.stopPrice,
      limitPrice: config.limitPrice,
      clientOrderId: config.clientId,
      triggerPriceType: config.triggerPriceType,
    };
  }

  // ── lectures marché supplémentaires (publiques ; I/O normalisés) ──
  public getFeeLevels(): Promise<FeeLevel[]> {
    return getFeeLevels(this.client, this.label);
  }
  public getMarkPriceCandles(params: MarkPriceCandlesParams): Promise<Candle[]> {
    return getMarkPriceCandleData(
      this.client,
      {
        symbol: params.name,
        interval: params.interval as CandleInterval,
        startTime: params.startTime === undefined ? 0 : dateToMs(params.startTime),
        endTime: params.endTime === undefined ? undefined : dateToMs(params.endTime),
      },
      this.label,
    );
  }
  // ── ordres avancés (signés ; entrées vocab commun, sorties types communs) ──
  public placeBatch(actions: PlaceBatchParams): Promise<Order[]> {
    return batchOrders(this.client, actions, this.signed()).then((result) =>
      batchResultToOrders(actions, result),
    );
  }
  public placeStop(params: PlaceStopParams): Promise<Order> {
    const side = params.side === 'buy' ? OrderSide.Bid : OrderSide.Ask;
    return createStopOrder(
      this.client,
      {
        symbol: params.name,
        side,
        reduceOnly: params.reduceOnly,
        stopOrder: {
          stopPrice: params.stopPrice,
          limitPrice: params.limitPrice,
          clientOrderId: params.clientId,
          triggerPriceType: params.triggerPriceType,
          amount: params.size,
        },
        builderCode: params.builderCode,
      },
      this.signed(),
    ).then((res) =>
      stopOrderToCommon({
        name: params.name,
        side: params.side,
        reduceOnly: params.reduceOnly,
        stopPrice: params.stopPrice,
        limitPrice: params.limitPrice,
        size: params.size,
        clientId: params.clientId,
        orderId: res.orderId,
      }),
    );
  }
  public cancelStop(params: CancelStopParams): Promise<void> {
    return cancelStopOrder(
      this.client,
      {
        symbol: params.name,
        orderId: params.id === undefined ? undefined : Number(params.id),
        clientOrderId: params.clientId,
      },
      this.signed(),
    );
  }
  public placeTpsl(params: PlaceTpslParams): Promise<void> {
    const side = params.side === 'buy' ? OrderSide.Bid : OrderSide.Ask;
    return createPositionTpsl(
      this.client,
      {
        symbol: params.name,
        side,
        takeProfit: params.takeProfit === undefined ? undefined : this.toTrigger(params.takeProfit),
        stopLoss: params.stopLoss === undefined ? undefined : this.toTrigger(params.stopLoss),
      },
      this.signed(),
    );
  }
  public getById(params: OrderByIdParams): Promise<Order> {
    const converter = new OrderHistoryByIdConverter();
    return getOrderHistoryById(this.client, { orderId: Number(params.id) }, this.label).then(
      (entries) => {
        const latest = entries[entries.length - 1];
        if (latest === undefined) {
          throw new Error(`getById (Pacifica) : ordre ${params.id} introuvable.`);
        }
        return converter.toCommon(latest);
      },
    );
  }
  public getTwaps(): Promise<Twap[]> {
    return getOpenTwapOrder(this.client, { account: this.user() }, this.label);
  }
  public getTwapHistory(params?: AccountHistoryParams): Promise<Twap[]> {
    return getTwapOrderHistory(
      this.client,
      { account: this.user(), limit: params?.limit, cursor: params?.cursor },
      this.label,
    ).then((page) => page.items);
  }
  public getTwapHistoryById(params: TwapByIdParams): Promise<Twap[]> {
    return getTwapOrderHistoryById(this.client, { orderId: Number(params.id) }, this.label);
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
  /** Adresse du compte (injectée dans les lectures — aucune entrée `account`). */
  private user(): string {
    const signer = this.client.signers[this.signed()];
    if (signer === undefined) {
      throw new Error(`Aucun signer enregistré sous "${this.label}".`);
    }
    return signer.publicKey;
  }

  public getPortfolio(params: PortfolioParams): Promise<PortfolioPoint[]> {
    return getPortfolio(
      this.client,
      {
        account: this.user(),
        timeRange: params.timeRange as PortfolioTimeRange,
        startTime: params.startTime === undefined ? undefined : dateToMs(params.startTime),
        endTime: params.endTime === undefined ? undefined : dateToMs(params.endTime),
        limit: params.limit,
      },
      this.label,
    );
  }
  public getSettings(): Promise<AccountSettings> {
    return getAccountSettings(this.client, { account: this.user() }, this.label);
  }
  public updateSettings(params: UpdateSettingsParams): Promise<void> {
    return updateSpotSettings(
      this.client,
      { symbol: params.name, unifiedMarginExcluded: params.unifiedMarginExcluded },
      this.signed(),
    );
  }
  public getBalanceHistory(params?: AccountHistoryParams): Promise<BalanceHistoryEntry[]> {
    return getBalanceHistory(
      this.client,
      { account: this.user(), limit: params?.limit, cursor: params?.cursor },
      this.label,
    ).then((page) => page.items);
  }
  public getTradeHistory(params?: AccountHistoryParams): Promise<UserTrade[]> {
    const converter = new UserTradeConverter();
    return getTradeHistory(
      this.client,
      {
        account: this.user(),
        symbol: params?.name,
        startTime: params?.startTime === undefined ? undefined : dateToMs(params.startTime),
        endTime: params?.endTime === undefined ? undefined : dateToMs(params.endTime),
        limit: params?.limit,
        cursor: params?.cursor,
      },
      this.label,
    ).then((page) =>
      page.items.map((entry) =>
        converter.toCommon({
          history_id: entry.historyId,
          order_id: entry.orderId,
          client_order_id: entry.clientOrderId,
          symbol: entry.symbol,
          amount: entry.amount,
          price: entry.price,
          entry_price: entry.entryPrice,
          fee: entry.fee,
          pnl: entry.pnl,
          event_type: entry.eventType,
          side: entry.side,
          cause: entry.cause,
          created_at: entry.createdAt,
        }),
      ),
    );
  }
  public getFunding(params?: AccountHistoryParams): Promise<AccountFundingEntry[]> {
    return getAccountFunding(
      this.client,
      { account: this.user(), limit: params?.limit, cursor: params?.cursor },
      this.label,
    ).then((page) => page.items);
  }
}

/** Scope **subaccounts** (création ; les transferts sont sur `transfers()`) — {@link ISubAccountsAdmin}. */
class PacificaSubAccounts extends PacificaScope implements ISubAccountsAdmin {
  public create(params: Parameters<typeof createSubaccount>[1]) {
    return createSubaccount(this.client, params);
  }
}

/**
 * Scope **transferts** (commun). `TransferParams` est **narrowé** à `to: { subAccount }` côté type
 * (cf. contract.ts) : aucune route invalide ne compile, donc **aucun throw** « non supporté » ici.
 * - sans `asset` → `transferSubaccountFund` (USDC perp master↔sous-compte) ;
 * - avec `asset` → `subaccountSpotTransfer` (token spot).
 */
class PacificaTransfers extends PacificaScope implements ITransfers {
  public transfer(p: TransferParams) {
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
   * Capacités **spécifiques à Pacifica**. Le namespace `native` **miroite** le commun :
   * `dex.native.perp()` (reads marché + ordres avancés, miroir de `perp()`), `dex.native.account()`
   * (réglages/historiques, ex-portfolio) ; + capacités propres `vaults`, `agents`, `apiKeys`,
   * `wallet`, `lending`, `subAccounts`, `ws`.
   */
  public get native() {
    const c = this.client;
    const r = (label?: string) => this.resolve(label);
    return {
      /** Surplus **perp** (miroir natif de perp()) : reads marché + ordres avancés (stop/tpsl/twap/batch). */
      perp: (label?: string) => new PacificaNativePerp(c, r(label)),
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
