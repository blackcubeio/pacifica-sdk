import type { MarketKind, OrderBook } from '../common/types';
import { httpGet } from './client';
import { OrderBookConverter, type OrderBookNative } from './converters/order-book';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetOrderBookParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché (Pacifica : `perp` uniquement). */
  kind?: MarketKind;
  /** Ignoré par Pacifica. */
  limit?: number;
}

/** Carnet d'ordres au **format unifié** `OrderBook` (Pacifica `/book`). */
export function getOrderBook(params: GetOrderBookParams, label?: string): Promise<OrderBook> {
  const converter = new OrderBookConverter('perp');
  return httpGet<OrderBookNative>('/book', { symbol: params.name }, label).then((envelope) =>
    converter.toCommon(envelope.data),
  );
}
