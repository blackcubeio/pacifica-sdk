import type { PacificaClient } from '../common/config';
import type { CandleInterval } from '../common/native';
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
import type { Unsubscribe } from '../common/ws';
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
          handler(converter.toCommon(raw as unknown as CandleNative));
        },
      ),
    );
  }

  /** Trades publics temps réel : le handler est appelé **une fois par trade**. */
  public subscribeTrades(params: { name: string }, handler: (trade: Trade) => void): Unsubscribe {
    const converter = new TradeWsConverter();
    return this.subscribe((ws) =>
      ws.subscribeTrades({ symbol: params.name }, (raw) => {
        for (const native of raw as unknown as TradeWsNative[]) {
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
        handler(converter.toCommon(raw as unknown as BboWsNative));
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
        handler(converter.toCommon(raw as unknown as OrderBookWsNative));
      }),
    );
  }

  /** Prix de tous les marchés (snapshot) : le handler reçoit un `Price[]` à chaque message. */
  public subscribePrices(handler: (prices: Price[]) => void): Unsubscribe {
    const converter = new PriceConverter();
    return this.subscribe((ws) =>
      ws.subscribePrices((raw) => {
        handler((raw as unknown as PriceNative[]).map((entry) => converter.toCommon(entry)));
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
        for (const native of raw as unknown as OrderUpdateWsNative[]) {
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
        for (const native of raw as unknown as UserTradeWsNative[]) {
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
        for (const native of raw as unknown as PositionWsNative[]) {
          handler(converter.toCommon(native));
        }
      }, params.user),
    );
  }
}
