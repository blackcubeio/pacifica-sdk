import type { Candle, MarketKind, Order, OrderBook, Price, Trade } from '../common/types';
import { type CandleNative, CandleConverter } from '../rest/converters/candle';
import { type PriceNative, PriceConverter } from '../rest/converters/price';
import type { CandleInterval } from '../rest/types';
import { type BboWsNative, BboWsConverter } from './converters/bbo';
import { type OrderUpdateWsNative, OrderWsConverter } from './converters/order';
import { type OrderBookWsNative, OrderBookWsConverter } from './converters/order-book';
import { type TradeWsNative, TradeWsConverter } from './converters/trade';
import { WsClient, type Unsubscribe, type WsClientOptions } from './client';

/**
 * Client WebSocket **unifié Blackcube** : surface identique entre les SDK. Chaque méthode
 * `subscribeX` délivre au handler le **type unifié déjà converti** (`Candle`, `OrderBook`…).
 * Wrappe le {@link WsClient} natif Pacifica (un seul socket public + user-data).
 *
 * Les converters WS sont **unidirectionnels** (`toCommon` seul) : le flux est en lecture
 * seule. Quand le payload WS coïncide avec le natif REST (cas des bougies), le convertisseur
 * REST est réutilisé tel quel.
 */
export class UnifiedWsClient {
  private readonly client: WsClient;

  constructor(options: WsClientOptions = {}) {
    this.client = new WsClient(options);
  }

  public connect(): Promise<void> {
    return this.client.connect();
  }

  public disconnect(): void {
    this.client.disconnect();
  }

  /** Bougies temps réel. `kind` (défaut `perp`) annote la bougie unifiée. */
  public subscribeCandles(
    params: { name: string; interval: string; kind?: MarketKind },
    handler: (candle: Candle) => void,
  ): Unsubscribe {
    const converter = new CandleConverter(params.kind ?? 'perp');
    return this.client.subscribeCandle(
      { symbol: params.name, interval: params.interval as CandleInterval },
      (raw) => {
        handler(converter.toCommon(raw as unknown as CandleNative));
      },
    );
  }

  /** Trades publics temps réel : le handler est appelé **une fois par trade**. */
  public subscribeTrades(
    params: { name: string },
    handler: (trade: Trade) => void,
  ): Unsubscribe {
    const converter = new TradeWsConverter();
    return this.client.subscribeTrades({ symbol: params.name }, (raw) => {
      for (const native of raw as unknown as TradeWsNative[]) {
        handler(converter.toCommon(native));
      }
    });
  }

  /** Meilleure limite (BBO) temps réel → {@link OrderBook} (1 niveau par côté). */
  public subscribeBbo(
    params: { name: string; kind?: MarketKind },
    handler: (book: OrderBook) => void,
  ): Unsubscribe {
    const converter = new BboWsConverter(params.kind ?? 'perp');
    return this.client.subscribeBbo({ symbol: params.name }, (raw) => {
      handler(converter.toCommon(raw as unknown as BboWsNative));
    });
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
    return this.client.subscribeOrderbook(
      { symbol: params.name, aggLevel: params.aggLevel ?? 1 },
      (raw) => {
        handler(converter.toCommon(raw as unknown as OrderBookWsNative));
      },
    );
  }

  /** Prix de tous les marchés (snapshot) : le handler reçoit un `Price[]` à chaque message. */
  public subscribePrices(handler: (prices: Price[]) => void): Unsubscribe {
    const converter = new PriceConverter();
    return this.client.subscribePrices((raw) => {
      handler((raw as unknown as PriceNative[]).map((entry) => converter.toCommon(entry)));
    });
  }

  /**
   * Mises à jour d'ordres du compte (user-data) : le handler est appelé **une fois par ordre**.
   * `user` = compte à observer (défaut : compte du signer `label`).
   */
  public subscribeOrders(
    params: { user?: string },
    handler: (order: Order) => void,
  ): Unsubscribe {
    const converter = new OrderWsConverter();
    return this.client.subscribeAccountOrderUpdates((raw) => {
      for (const native of raw as unknown as OrderUpdateWsNative[]) {
        handler(converter.toCommon(native));
      }
    }, params.user);
  }
}
