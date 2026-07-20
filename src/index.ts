// ── Surface publique du SDK Pacifica ──────────────────────────────────────────
// Point d'entrée principal : la classe `Pacifica`. Tout le reste (fonctions REST, clients WS
// bruts, signing) est interne et n'est pas exporté.
//
// Seule exception runtime hors façade : `deposit` (transaction Solana on-chain, pas une route
// API Pacifica). Il a besoin d'un `PacificaClient` que l'appelant construit avec `init`. Ces
// deux symboles + les constantes devnet sont donc exportés en **valeur**.

/**
 * Façade : `new Pacifica(signers, { default })` puis les scopes
 * `.perp()/.account()/.transfers()/.helpers()/.ws()` et le namespace `.native`.
 * (Pas de `.system()` : Pacifica n'a ni ping ni horloge serveur publics.)
 */
export { Pacifica, type PacificaDexOptions } from './dex/pacifica';

/**
 * Dépôt on-chain (Solana) — **seule fonction libre** hors façade. L'appelant construit son
 * `PacificaClient` via {@link init}, puis : `deposit(client, params, label)`.
 */
export {
  buildDepositData,
  deposit,
  DEVNET_CENTRAL_STATE,
  DEVNET_COLLATERAL_MINT,
  DEVNET_DEPOSIT_PROGRAM_ID,
  DEVNET_RPC_URL,
} from './rest/deposit';

/** Constructeur de `PacificaClient` (requis par {@link deposit}). */
export { init } from './common/config';

/** Types du client/options de configuration (paramètres de {@link init} et de {@link deposit}). */
export type { InitOptions, PacificaClient } from './common/config';

/** Paramètres de {@link deposit}. */
export type { DepositParams } from './common/types';

/** Contrat commun aux DEX : interfaces de capacités + types d'entrée (Input) des méthodes. */
export type * from './dex/contract';

/** Interfaces **complémentaires** Pacifica (vaults/agents/apiKeys/wallet/lending/account/subAccounts). */
export type * from './dex/native-contract';

/** Configuration d'un signer (passé au constructeur) et réseau. */
export type { Signer, Network } from './common/types';

/** Types **de sortie** unifiés renvoyés par les méthodes de la façade. */
export type {
  Balance,
  Candle,
  EquityPoint,
  EquityRange,
  FundingRate,
  MarketKind,
  Order,
  OrderBook,
  OrderBookLevel,
  Pair,
  Position,
  Price,
  Side,
  SubAccount,
  Trade,
  UserTrade,
} from './common/types';

/** Unsubscribe : valeur de retour des souscriptions WS. */
export type { Unsubscribe } from './common/ws';
