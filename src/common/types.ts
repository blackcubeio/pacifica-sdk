export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;

export interface JsonObject {
  [key: string]: JsonValue;
}

export enum OperationType {
  CreateOrder = 'create_order',
  CreateMarketOrder = 'create_market_order',
  CancelOrder = 'cancel_order',
  CancelAllOrders = 'cancel_all_orders',
  EditOrder = 'edit_order',
  CreateStopOrder = 'create_stop_order',
  CancelStopOrder = 'cancel_stop_order',
  SetPositionTpsl = 'set_position_tpsl',
  UpdateLeverage = 'update_leverage',
  UpdateMarginMode = 'update_margin_mode',
  AddIsolatedMargin = 'add_isolated_margin',
  SetAutoLendDisabled = 'set_auto_lend_disabled',
  UpdateAccountSpotSettings = 'update_account_spot_settings',
  Withdraw = 'withdraw',
  WithdrawSpotAsset = 'withdraw_spot_asset',
  SubaccountInitiate = 'subaccount_initiate',
  SubaccountConfirm = 'subaccount_confirm',
  ListSubaccounts = 'list_subaccounts',
  TransferFunds = 'transfer_funds',
  SubaccountSpotTransfer = 'subaccount_spot_transfer',
  BindAgentWallet = 'bind_agent_wallet',
  ListAgentWallets = 'list_agent_wallets',
  RevokeAgentWallet = 'revoke_agent_wallet',
  RevokeAllAgentWallets = 'revoke_all_agent_wallets',
  ListAgentIpWhitelist = 'list_agent_ip_whitelist',
  AddAgentWhitelistedIp = 'add_agent_whitelisted_ip',
  RemoveAgentWhitelistedIp = 'remove_agent_whitelisted_ip',
  SetAgentIpWhitelistEnabled = 'set_agent_ip_whitelist_enabled',
  CreateApiKey = 'create_api_key',
  RevokeApiKey = 'revoke_api_key',
  ListApiKeys = 'list_api_keys',
  CreateLake = 'create_lake',
  DepositToLake = 'deposit_to_lake',
  WithdrawFromLake = 'withdraw_from_lake',
  ClaimLakeReferral = 'claim_lake_referral',
  ClaimLakeManager = 'claim_lake_manager',
  UpdateLakeDepositCap = 'update_lake_deposit_cap',
  AddLakeWhitelist = 'add_lake_whitelist',
  RemoveLakeWhitelist = 'remove_lake_whitelist',
  AddLakeBlacklist = 'add_lake_blacklist',
  RemoveLakeBlacklist = 'remove_lake_blacklist',
  AddLakeMaxLeverage = 'add_lake_max_leverage',
  RemoveLakeMaxLeverage = 'remove_lake_max_leverage',
}

export enum OrderSide {
  Bid = 'bid',
  Ask = 'ask',
}

export enum TimeInForce {
  Gtc = 'GTC',
  Ioc = 'IOC',
  Fok = 'FOK',
  Alo = 'ALO',
  Tob = 'TOB',
}

export enum TriggerPriceType {
  MarkPrice = 'mark_price',
  LastTradePrice = 'last_trade_price',
  MidPrice = 'mid_price',
}

export interface SignatureHeader {
  timestamp: number;
  expiryWindow: number;
  type: OperationType;
}

export interface HardwareSignature {
  type: 'hardware';
  value: string;
}

export type Network = 'mainnet' | 'testnet';

/** Type de marché d'une paire : perpetual ou spot. */
export type MarketKind = 'perp' | 'spot';

/**
 * Paire/marché au **format unifié Blackcube** (mêmes champs entre les SDK
 * hyperliquid/pacifica/aster, calqués sur HL). Prix/quantités = **chaînes décimales**.
 * `raw` conserve l'objet d'origine **complet** de l'exchange : rien n'est jeté.
 */
export interface Pair {
  /** Nom/identifiant de la paire (ex. `BTC`). */
  name: string;
  /** Actif de base. */
  base: string;
  /** Actif de cotation. */
  quote: string;
  /** Type de marché (`perp`/`spot`). */
  kind: MarketKind;
  /** Décimales de taille → pas de quantité = `10^-szDecimals`. */
  szDecimals: number;
  /** Levier max (perp uniquement), si fourni. */
  maxLeverage?: number;
  /** Pas de prix, si fourni. */
  tickSize?: string;
  /** Pas de quantité, si fourni. */
  stepSize?: string;
  /** Notionnel minimum d'un ordre, si fourni. */
  minNotional?: string;
  /** État du marché, si fourni. */
  status?: string;
  /**
   * Champs natifs **hors cœur unifié** (rien n'est jeté). **Optionnel** : omis si tout le natif
   * mappe le cœur. Pacifica : `minTick`/`maxTick`, `minOrderSize`/`maxOrderSize`, `fundingRate`…
   */
  xtras?: Record<string, unknown>;
}

/**
 * Bougie OHLCV au **format unifié Blackcube** (clés courtes, cœur identique entre les SDK
 * hyperliquid/pacifica/aster). Prix et volumes sont des **chaînes décimales**.
 *
 * Le **cœur** (`t…kind`) regroupe les champs vraiment communs aux 3 exchanges.
 * `qv`/`tbbv`/`tbqv` sont nullables (renseignés par Aster, `null` chez HL/Pacifica).
 * `xtras` porte le reste non modélisé : **rien n'est jeté**, `toNative(toCommon(x)) ≡ x`.
 */
export interface Candle {
  /** Open time — début de la bougie (timestamp ms). */
  t: number;
  /** Close time — fin de la bougie (timestamp ms). */
  T: number;
  /** Symbol — symbole/paire (ex. `BTC`). */
  s: string;
  /** Interval — intervalle (ex. `1h`). */
  i: string;
  /** Open — prix d'ouverture. */
  o: string;
  /** Close — prix de clôture. */
  c: string;
  /** High — plus haut. */
  h: string;
  /** Low — plus bas. */
  l: string;
  /** Volume — volume en actif de base. */
  v: string;
  /** Number of trades — nombre de trades. */
  n: number;
  /** Type de marché (`perp`/`spot`). */
  kind: MarketKind;
  /** Quote volume — `null` si l'exchange ne le fournit pas (cas Pacifica). */
  qv: string | null;
  /** Taker buy base volume — `null` si non fourni. */
  tbbv: string | null;
  /** Taker buy quote volume — `null` si non fourni. */
  tbqv: string | null;
  /**
   * Reste des champs **non standard / non modélisés** (rien n'est jeté).
   * **Optionnel** : omis quand il n'y a rien à y mettre (cas Pacifica).
   */
  xtras?: Record<string, unknown>;
}

/** Niveau de carnet au **format unifié** (prix + taille ; `n` = nb d'ordres, `null` si non fourni). */
export interface OrderBookLevel {
  /** Prix du niveau (chaîne décimale). */
  price: string;
  /** Taille cumulée au niveau (chaîne décimale). */
  size: string;
  /** Nombre d'ordres au niveau ; `null` si l'exchange ne le fournit pas. */
  n: number | null;
}

/**
 * Carnet d'ordres au **format unifié Blackcube** (cœur identique entre les SDK).
 * `bids` décroissants, `asks` croissants. `time` = timestamp ms (`null` si non fourni).
 * `xtras` porte le natif hors cœur (rien jeté), omis si vide.
 */
export interface OrderBook {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché (`perp`/`spot`). */
  kind: MarketKind;
  /** Niveaux acheteurs (prix décroissant). */
  bids: OrderBookLevel[];
  /** Niveaux vendeurs (prix croissant). */
  asks: OrderBookLevel[];
  /** Timestamp du carnet (ms) ; `null` si non fourni. */
  time: number | null;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/**
 * Snapshot de prix d'un marché au **format unifié Blackcube** (cœur identique entre les SDK).
 * Chaque exchange remplit ce qu'il fournit ; le reste est `null`. `xtras` porte le hors-cœur.
 */
export interface Price {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché (`perp`/`spot`). */
  kind: MarketKind;
  /** Mark price ; `null` si non fourni. */
  mark: string | null;
  /** Oracle/index price ; `null` si non fourni. */
  oracle: string | null;
  /** Mid price ; `null` si non fourni. */
  mid: string | null;
  /** Meilleur bid ; `null` si non fourni. */
  bid: string | null;
  /** Meilleur ask ; `null` si non fourni. */
  ask: string | null;
  /** Dernier prix négocié ; `null` si non fourni. */
  last: string | null;
  /** Funding rate courant ; `null` si non fourni. */
  funding: string | null;
  /** Open interest ; `null` si non fourni. */
  openInterest: string | null;
  /** Volume 24h (notionnel) ; `null` si non fourni. */
  volume24h: string | null;
  /** Prix de clôture de la veille ; `null` si non fourni. */
  prevDayPrice: string | null;
  /** Timestamp (ms) ; `null` si non fourni. */
  time: number | null;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/** Côté d'un ordre/trade : achat ou vente. */
export type Side = 'buy' | 'sell';

/**
 * Ordre au **format unifié Blackcube** (cœur identique entre SDK). Type-pivot partagé
 * par les lectures (`getOpenOrders`/`getOrderHistory`) et le trading (`placeOrder`…).
 * `side`/`type`/`status`/`tif` sont des littéraux unifiés (sources natives dans `xtras`).
 */
export interface Order {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché (`perp`/`spot`). */
  kind: MarketKind;
  /** ID d'ordre exchange. */
  id: string;
  /** Client order id ; `null` si absent. */
  clientId: string | null;
  /** Sens. */
  side: Side;
  /** Type d'ordre unifié. */
  type:
    | 'limit'
    | 'market'
    | 'stop'
    | 'stopMarket'
    | 'takeProfit'
    | 'takeProfitMarket'
    | 'trailingStop'
    | 'other';
  /** Prix limite ; `null` si non applicable (marché). */
  price: string | null;
  /** Quantité demandée (chaîne décimale). */
  size: string;
  /** Quantité exécutée. */
  filled: string;
  /** Statut unifié. */
  status: 'open' | 'partiallyFilled' | 'filled' | 'canceled' | 'rejected' | 'expired' | 'other';
  /** Time-in-force unifié ; `null` si non fourni. */
  tif: 'gtc' | 'ioc' | 'fok' | 'alo' | null;
  /** Reduce-only ; `null` si non fourni. */
  reduceOnly: boolean | null;
  /** Timestamp (ms). */
  time: number;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/**
 * Exécution (fill) du compte au **format unifié Blackcube** (cœur identique entre SDK).
 * `side` = sens du fill, `maker` = rôle. `xtras` porte le natif hors cœur, omis si vide.
 */
export interface UserTrade {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché (`perp`/`spot`). */
  kind: MarketKind;
  /** ID du fill/trade. */
  id: string;
  /** ID de l'ordre parent. */
  orderId: string;
  /** Sens. */
  side: Side;
  /** Prix d'exécution. */
  price: string;
  /** Taille exécutée. */
  size: string;
  /** Frais. */
  fee: string;
  /** Actif des frais ; `null` si non fourni. */
  feeAsset: string | null;
  /** PnL réalisé/clôturé ; `null` si non fourni. */
  pnl: string | null;
  /** Rôle maker ; `null` si non fourni. */
  maker: boolean | null;
  /** Timestamp (ms). */
  time: number;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/**
 * Position ouverte au **format unifié Blackcube** (cœur identique entre SDK).
 * `side`/`size`/`leverage` dérivés (source native dans `xtras`). Champs nullables si non fournis.
 */
export interface Position {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Sens : `long`/`short` (`null` si plate). */
  side: 'long' | 'short' | null;
  /** Taille absolue (chaîne décimale, sans signe). */
  size: string;
  /** Prix d'entrée ; `null` si non fourni. */
  entryPrice: string | null;
  /** Mark price ; `null` si non fourni. */
  markPrice: string | null;
  /** PnL non réalisé ; `null` si non fourni. */
  unrealizedPnl: string | null;
  /** Levier ; `null` si non fourni. */
  leverage: number | null;
  /** Prix de liquidation ; `null` si non fourni. */
  liquidationPrice: string | null;
  /** Marge engagée ; `null` si non fournie. */
  margin: string | null;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/**
 * Solde d'un actif au **format unifié Blackcube** (cœur identique entre SDK).
 * `available`/`usdValue` `null` si non fournis. `xtras` porte le natif hors cœur, omis si vide.
 */
export interface Balance {
  /** Actif (ex. `USDC`, `BTC`). */
  asset: string;
  /** Solde total (chaîne décimale). */
  total: string;
  /** Disponible (chaîne décimale) ; `null` si non fourni. */
  available: string | null;
  /** Valeur en USD ; `null` si non fournie. */
  usdValue: string | null;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/**
 * Sous-compte au **format unifié Blackcube** (cœur identique entre SDK).
 * Seule l'`address` est commune aux exchanges ; tout le reste (solde, fee tier,
 * nom, date de création, balances…) est propre à chaque exchange → `xtras`.
 */
export interface SubAccount {
  /** Adresse du sous-compte (ou du compte principal). */
  address: string;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/**
 * Trade public au **format unifié Blackcube** (cœur identique entre les SDK).
 * `side` = direction du **taker** (agresseur). `maker` = ce record est-il le maker
 * (`null` si modèle par-trade). `xtras` porte le natif hors cœur.
 */
export interface Trade {
  /** Prix d'exécution (chaîne décimale). */
  price: string;
  /** Taille exécutée (chaîne décimale). */
  size: string;
  /** Direction du taker/agresseur ; `null` si indéterminé. */
  side: Side | null;
  /** Ce record est-il le maker ; `null` si non applicable. */
  maker: boolean | null;
  /** Timestamp (ms). */
  time: number;
  /** ID du trade ; `null` si non fourni. */
  id: number | null;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

/**
 * Point d'historique de **taux de funding** au format unifié (cœur identique entre SDK).
 * `xtras` porte le natif hors cœur (oracle/impact/next Pacifica…), omis si vide.
 */
export interface FundingRate {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Taux de funding (chaîne décimale). */
  fundingRate: string;
  /** Timestamp du funding (ms). */
  time: number;
  /** Champs natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

export interface Signer {
  secretKey: string;
  publicKey: string;
  network: Network;
  agentWallet?: string;
}

export type Signature = string | HardwareSignature;

export interface SignedRequestHeader {
  account: string;
  signature: Signature;
  timestamp: number;
  expiryWindow: number;
  agentWallet?: string;
}

export type SignedRequest<TPayload> = SignedRequestHeader & TPayload;

export interface SignedMessage<TSignature extends Signature = string> {
  message: string;
  signature: TSignature;
}

// ── depuis rest/cancel-all-orders.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface CancelAllOrdersParams {
  /** Paire/symbole (= `Pair.name`) ; toutes les paires si omis. */
  name?: string;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
}

/** Résultat unifié d'une annulation globale. */
export interface CancelAllResult {
  /** Nombre d'ordres annulés ; `null` si non fourni. */
  cancelled: number | null;
}

// ── depuis rest/cancel-order.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface CancelOrderParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** ID d'ordre exchange (l'un de `id`/`clientId` requis). */
  id?: string;
  /** Client order id. */
  clientId?: string;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
}

// ── depuis rest/client.ts ──
export type QueryValue = string | number | boolean;

export type QueryParams = Record<string, QueryValue | undefined>;

export interface ApiEnvelope<TData> {
  success: boolean;
  data: TData;
  error: string | null;
  code: number | null;
  next_cursor?: string | null;
  has_more?: boolean;
  last_order_id?: number;
}

// ── depuis rest/deposit.ts ──
export interface DepositParams {
  amount: number;
  rpcUrl?: string;
  rpcSubscriptionsUrl?: string;
  programId?: string;
  centralState?: string;
  collateralMint?: string;
  decimals?: number;
}

// ── depuis rest/edit-order.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface EditOrderParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Nouvelle quantité. */
  size: string;
  /** Nouveau prix. */
  price: string;
  /** ID d'ordre exchange (l'un de `id`/`clientId` requis). */
  id?: string;
  /** Client order id. */
  clientId?: string;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
}

/** Résultat unifié d'une modification d'ordre (référence du nouvel ordre). */
export interface EditOrderResult {
  /** Paire/symbole. */
  name: string;
  /** ID du nouvel ordre. */
  id: string;
  /** Détails natifs hors cœur (rien jeté), omis si vide. */
  xtras?: Record<string, unknown>;
}

// ── depuis rest/get-balances.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetBalancesParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
}

// ── depuis rest/get-candles.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetCandlesParams {
  /** Identifiant de la paire (= `Pair.name`). */
  name: string;
  /** Intervalle (`1m`, `1h`, `1d`…). */
  interval: string;
  /** Début (ms). */
  startTime: number;
  /** Fin (ms), optionnel. */
  endTime?: number;
  /** Type de marché (Pacifica : `perp` uniquement). */
  kind?: MarketKind;
  /** Ignoré par Pacifica. */
  limit?: number;
}

// ── depuis rest/get-funding-history.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetFundingHistoryParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Nombre de points. */
  limit?: number;
  /** Curseur de pagination (Pacifica). */
  cursor?: string;
}

// ── depuis rest/get-open-orders.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetOpenOrdersParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
  /** Filtre optionnel sur une paire (appliqué côté client). */
  name?: string;
}

// ── depuis rest/get-order-book.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetOrderBookParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché (Pacifica : `perp` uniquement). */
  kind?: MarketKind;
  /** Ignoré par Pacifica. */
  limit?: number;
}

// ── depuis rest/get-order-history.ts ──
/** Paramètres unifiés (mêmes champs sur les SDK concernés). */
export interface GetOrderHistoryParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
  /** Filtre optionnel sur une paire. */
  name?: string;
  /** Nombre max. */
  limit?: number;
  /** Curseur de pagination (Pacifica). */
  cursor?: string;
}

// ── depuis rest/get-positions.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetPositionsParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
  /** Filtre optionnel sur une paire (appliqué côté client). */
  name?: string;
}

// ── depuis rest/get-trades.ts ──
/** Paramètres unifiés (mêmes champs sur les SDK qui exposent les trades publics). */
export interface GetTradesParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché (Pacifica : `perp` uniquement). */
  kind?: MarketKind;
  /** Ignoré par Pacifica. */
  limit?: number;
}

// ── depuis rest/get-user-trades.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetUserTradesParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
  /** Filtre optionnel sur une paire. */
  name?: string;
  /** Début (ms). */
  startTime?: number;
  /** Fin (ms). */
  endTime?: number;
  /** Nombre max. */
  limit?: number;
}

// ── depuis rest/place-order.ts ──
/** Type d'ordre unifié supporté par Pacifica (`placeOrder`). */
export type PlaceOrderType =
  | 'limit'
  | 'market'
  | 'stop'
  | 'stopMarket'
  | 'takeProfit'
  | 'takeProfitMarket';

/** Time-in-force unifié. */
export type PlaceOrderTif = 'gtc' | 'ioc' | 'fok' | 'alo';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface PlaceOrderParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
  /** Sens. */
  side: Side;
  /** Type d'ordre (`limit`/`market`). */
  type: PlaceOrderType;
  /** Quantité (chaîne décimale). */
  size: string;
  /** Prix limite (requis pour `limit`). */
  price?: string;
  /** Prix de déclenchement (stop/take-profit). Présent ⇒ ordre déclenché (route vers le stop natif). */
  triggerPrice?: string;
  /** Time-in-force (limit). */
  tif?: PlaceOrderTif;
  /** Reduce-only. */
  reduceOnly?: boolean;
  /** Client order id. */
  clientId?: string;
  /** Slippage max en % (ordres `market` Pacifica) ; défaut `1`. */
  slippagePercent?: string;
}

// ── depuis rest/signing.ts ──
export interface ResolvedSigner {
  label: string;
  account: string;
  secretKey: string;
  network: Network;
  agentWallet?: string;
}

// ── depuis rest/update-leverage.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface UpdateLeverageParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Levier cible (entier). */
  leverage: number;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
}

/** Confirmation unifiée d'un changement de levier. */
export interface LeverageUpdate {
  name: string;
  leverage: number;
  xtras?: Record<string, unknown>;
}

// ── depuis rest/update-margin-mode.ts ──
/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface UpdateMarginModeParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** `true` = marge isolée, `false` = cross. */
  isolated: boolean;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
}
