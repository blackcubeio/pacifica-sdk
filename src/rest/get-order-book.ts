import type { PacificaClient } from '../common/config';
import type { GetOrderBookParams } from '../common/types';
import type { OrderBook } from '../common/types';
import { OrderBookConverter, type OrderBookNative } from '../converters/order-book';
import { httpGet } from './client';

/** Carnet d'ordres au **format unifié** `OrderBook` (Pacifica `/book`). */
export function getOrderBook(
  client: PacificaClient,
  params: GetOrderBookParams,
  label?: string,
): Promise<OrderBook> {
  const converter = new OrderBookConverter('perp');
  return httpGet<OrderBookNative>(client, '/book', { symbol: params.name }, label).then(
    (envelope) => converter.toCommon(envelope.data),
  );
}
