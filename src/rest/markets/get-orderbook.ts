import { httpGet } from '../client';
import type { Orderbook, OrderbookLevel, OrderbookQuery } from '../types';

interface OrderbookLevelWire {
  p: string;
  a: string;
  n: number;
}

interface OrderbookWire {
  s: string;
  l: [OrderbookLevelWire[], OrderbookLevelWire[]];
  t: number;
}

export function getOrderbook(query: OrderbookQuery): Promise<Orderbook> {
  return httpGet<OrderbookWire>('/book', {
    symbol: query.symbol,
    agg_level: query.aggLevel,
  }).then((envelope) => mapOrderbook(envelope.data));
}

function mapOrderbook(wire: OrderbookWire): Orderbook {
  const bids = wire.l[0];
  const asks = wire.l[1];
  return {
    symbol: wire.s,
    bids: bids.map((level) => mapLevel(level)),
    asks: asks.map((level) => mapLevel(level)),
    timestamp: wire.t,
  };
}

function mapLevel(wire: OrderbookLevelWire): OrderbookLevel {
  return {
    price: wire.p,
    amount: wire.a,
    orderCount: wire.n,
  };
}
