import type { GetOrderBookParams } from '../common/types';
import type { MarketKind, OrderBook } from '../common/types';
import { OrderBookConverter, type OrderBookNative } from '../converters/order-book';
import { httpGet } from './client';

/** Carnet d'ordres au **format unifié** `OrderBook` (Pacifica `/book`). */
export function getOrderBook(params: GetOrderBookParams, label?: string): Promise<OrderBook> {
  const converter = new OrderBookConverter('perp');
  return httpGet<OrderBookNative>('/book', { symbol: params.name }, label).then((envelope) =>
    converter.toCommon(envelope.data),
  );
}
