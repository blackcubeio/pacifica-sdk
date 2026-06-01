import type { PacificaClient } from '../common/config';
import type { CandleInterval } from '../common/native';
import type {
  BatchAction,
  CancelAllOrdersRef,
  CancelOrderRef,
  CreateLimitOrderParams,
  CreateMarketOrderParams,
  EditOrderRef,
} from '../common/native';
import type {
  Candle,
  MarketKind,
  Order,
  OrderBook,
  Position,
  Price,
  Trade,
  UserTrade,
} from '../common/types';
import type { JsonValue } from '../common/types';
import type { Unsubscribe } from '../common/ws';
import type { StreamHandler } from '../common/ws';
import { BboWsConverter, type BboWsNative } from '../converters/bbo';
import { CandleConverter, type CandleNative } from '../converters/candle';
import { type OrderUpdateWsNative, OrderWsConverter } from '../converters/order';
import { OrderBookWsConverter, type OrderBookWsNative } from '../converters/order-book';
import { PositionWsConverter, type PositionWsNative } from '../converters/position';
import { PriceConverter, type PriceNative } from '../converters/price';
import { TradeWsConverter, type TradeWsNative } from '../converters/trade';
import { UserTradeWsConverter, type UserTradeWsNative } from '../converters/user-trade';
import { WsClient } from './client';

/**
 * Frontière de parsing WS : le `StreamHandler` natif délivre un `JsonValue` (JSON déjà parsé, shape
 * non connue du compilateur). On l'interprète comme le type natif attendu du flux. **Seul** double
 * cast strictement nécessaire du module (les converters `toNative` REST ont été resserrés) : un
 * changement de shape backend serait attrapé par le converter `toCommon` (champs absents → `xtras`),
 * pas ici. Centralisé pour ne pas disséminer le `as unknown as` sur chaque souscription.
 */
function fromWire<T>(raw: JsonValue): T {
  return raw as unknown as T;
}

/**
 * Client WebSocket **unifié Blackcube** (interne ; exposé via `Pacifica.ws()`). Chaque méthode
 * `subscribeX` délivre au handler le **type unifié déjà converti** (`Candle`, `OrderBook`…).
 * Wrappe le {@link WsClient} natif Pacifica (un seul socket : public + user-data).
 *
 * **Connexion automatique** : le socket est ouvert paresseusement à la 1ʳᵉ souscription et fermé
 * dès que le dernier abonnement est retiré (ref-counting). Le développeur ne gère que
 * `subscribeX(…) → unsubscribe()`. Converters WS **unidirectionnels** (lecture seule).
 */
export class UnifiedWsClient {
  private readonly client: PacificaClient;
  private readonly label: string | undefined;
  private ws: WsClient | null = null;
  private refs = 0;

  constructor(client: PacificaClient, label?: string) {
    this.client = client;
    this.label = label;
  }

  /** Ouvre (lazy) le socket et renvoie le client ; incrémente le ref-count. */
  private wsClient(): WsClient {
    if (this.ws === null) {
      this.ws = new WsClient(this.client, { label: this.label });
      void this.ws.connect();
    }
    this.refs += 1;
    return this.ws;
  }

  /** Décrémente le ref-count et ferme le socket s'il tombe à zéro. */
  private release(): void {
    this.refs -= 1;
    if (this.refs <= 0 && this.ws !== null) {
      this.ws.disconnect();
      this.ws = null;
      this.refs = 0;
    }
  }

  /** Souscription ref-comptée : ouvre le socket au 1er abonné, ferme au dernier. */
  private subscribe(fn: (ws: WsClient) => Unsubscribe): Unsubscribe {
    const off = fn(this.wsClient());
    let released = false;
    return () => {
      if (released === true) {
        return;
      }
      released = true;
      off();
      this.release();
    };
  }

  /** Bougies temps réel. `kind` (défaut `perp`) annote la bougie unifiée. */
  public subscribeCandles(
    params: { name: string; interval: string; kind?: MarketKind },
    handler: (candle: Candle) => void,
  ): Unsubscribe {
    const converter = new CandleConverter(params.kind ?? 'perp');
    return this.subscribe((ws) =>
      ws.subscribeCandle(
        { symbol: params.name, interval: params.interval as CandleInterval },
        (raw) => {
          handler(converter.toCommon(fromWire<CandleNative>(raw)));
        },
      ),
    );
  }

  /** Trades publics temps réel : le handler est appelé **une fois par trade**. */
  public subscribeTrades(params: { name: string }, handler: (trade: Trade) => void): Unsubscribe {
    const converter = new TradeWsConverter();
    return this.subscribe((ws) =>
      ws.subscribeTrades({ symbol: params.name }, (raw) => {
        for (const native of fromWire<TradeWsNative[]>(raw)) {
          handler(converter.toCommon(native));
        }
      }),
    );
  }

  /** Meilleure limite (BBO) temps réel → {@link OrderBook} (1 niveau par côté). */
  public subscribeBbo(
    params: { name: string; kind?: MarketKind },
    handler: (book: OrderBook) => void,
  ): Unsubscribe {
    const converter = new BboWsConverter(params.kind ?? 'perp');
    return this.subscribe((ws) =>
      ws.subscribeBbo({ symbol: params.name }, (raw) => {
        handler(converter.toCommon(fromWire<BboWsNative>(raw)));
      }),
    );
  }

  /**
   * Carnet d'ordres (L2) temps réel → {@link OrderBook}. `aggLevel` (défaut `1`) est
   * **requis** côté Pacifica : sans lui, le flux `book` ne pousse rien.
   */
  public subscribeOrderBook(
    params: { name: string; kind?: MarketKind; aggLevel?: number },
    handler: (book: OrderBook) => void,
  ): Unsubscribe {
    const converter = new OrderBookWsConverter(params.kind ?? 'perp');
    return this.subscribe((ws) =>
      ws.subscribeOrderbook({ symbol: params.name, aggLevel: params.aggLevel ?? 1 }, (raw) => {
        handler(converter.toCommon(fromWire<OrderBookWsNative>(raw)));
      }),
    );
  }

  /** Prix de tous les marchés (snapshot) : le handler reçoit un `Price[]` à chaque message. */
  public subscribePrices(handler: (prices: Price[]) => void): Unsubscribe {
    const converter = new PriceConverter();
    return this.subscribe((ws) =>
      ws.subscribePrices((raw) => {
        handler(fromWire<PriceNative[]>(raw).map((entry) => converter.toCommon(entry)));
      }),
    );
  }

  /**
   * Mises à jour d'ordres du compte (user-data) : le handler est appelé **une fois par ordre**.
   * `user` = compte à observer (défaut : compte du signer `label`).
   */
  public subscribeOrders(params: { user?: string }, handler: (order: Order) => void): Unsubscribe {
    const converter = new OrderWsConverter();
    return this.subscribe((ws) =>
      ws.subscribeAccountOrderUpdates((raw) => {
        for (const native of fromWire<OrderUpdateWsNative[]>(raw)) {
          handler(converter.toCommon(native));
        }
      }, params.user),
    );
  }

  /** Fills du compte (user-data) : le handler est appelé **une fois par fill**. */
  public subscribeUserTrades(
    params: { user?: string },
    handler: (trade: UserTrade) => void,
  ): Unsubscribe {
    const converter = new UserTradeWsConverter();
    return this.subscribe((ws) =>
      ws.subscribeAccountTrades((raw) => {
        for (const native of fromWire<UserTradeWsNative[]>(raw)) {
          handler(converter.toCommon(native));
        }
      }, params.user),
    );
  }

  /** Positions du compte (user-data) : le handler est appelé **une fois par position**. */
  public subscribePositions(
    params: { user?: string },
    handler: (position: Position) => void,
  ): Unsubscribe {
    const converter = new PositionWsConverter();
    return this.subscribe((ws) =>
      ws.subscribeAccountPositions((raw) => {
        for (const native of fromWire<PositionWsNative[]>(raw)) {
          handler(converter.toCommon(native));
        }
      }, params.user),
    );
  }

  // ── Surplus NATIF (exposé via `dex.native.ws()`) : flux compte bruts + trading via WS ──
  // Ces flux livrent la charge **native brute** (pas de converter unifié). Ref-counting identique.
  public subscribeAccountInfo(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribe((ws) => ws.subscribeAccountInfo(handler, account));
  }
  public subscribeAccountMargin(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribe((ws) => ws.subscribeAccountMargin(handler, account));
  }
  public subscribeAccountLeverage(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribe((ws) => ws.subscribeAccountLeverage(handler, account));
  }
  public subscribeAccountTransfers(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribe((ws) => ws.subscribeAccountTransfers(handler, account));
  }
  public subscribeAccountTwapOrders(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribe((ws) => ws.subscribeAccountTwapOrders(handler, account));
  }

  /** Action de trading **one-shot** via WS : ouvre le socket (lazy), envoie, libère après réponse. */
  private async action<T>(run: (ws: WsClient) => Promise<T>): Promise<T> {
    const ws = this.wsClient();
    try {
      return await run(ws);
    } finally {
      this.release();
    }
  }
  public createLimitOrder(params: CreateLimitOrderParams): Promise<JsonValue> {
    return this.action((ws) => ws.createLimitOrder(params));
  }
  public createMarketOrder(params: CreateMarketOrderParams): Promise<JsonValue> {
    return this.action((ws) => ws.createMarketOrder(params));
  }
  public cancelOrder(params: CancelOrderRef): Promise<JsonValue> {
    return this.action((ws) => ws.cancelOrder(params));
  }
  public cancelAllOrders(params: CancelAllOrdersRef): Promise<JsonValue> {
    return this.action((ws) => ws.cancelAllOrders(params));
  }
  public editOrder(params: EditOrderRef): Promise<JsonValue> {
    return this.action((ws) => ws.editOrder(params));
  }
  public batchOrders(actions: BatchAction[]): Promise<JsonValue> {
    return this.action((ws) => ws.batchOrders(actions));
  }
}
