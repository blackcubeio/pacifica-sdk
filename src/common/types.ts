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
  /** Objet d'origine **complet** renvoyé par l'exchange (aucune donnée jetée). */
  raw: Record<string, unknown>;
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
