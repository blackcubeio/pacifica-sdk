import { httpGet } from '../client';
import type {
  RecentTrades,
  RecentTradesQuery,
  Trade,
  TradeCause,
  TradeEventType,
  TradeSide,
} from '../types';

interface TradeWire {
  event_type: TradeEventType;
  price: string;
  amount: string;
  side: TradeSide;
  cause: TradeCause;
  created_at: number;
}

export function getRecentTrades(query: RecentTradesQuery): Promise<RecentTrades> {
  return httpGet<TradeWire[]>('/trades', { symbol: query.symbol }).then((envelope) => ({
    trades: envelope.data.map((trade) => mapTrade(trade)),
    lastOrderId: envelope.last_order_id ?? 0,
  }));
}

function mapTrade(wire: TradeWire): Trade {
  return {
    eventType: wire.event_type,
    price: wire.price,
    amount: wire.amount,
    side: wire.side,
    cause: wire.cause,
    createdAt: wire.created_at,
  };
}
