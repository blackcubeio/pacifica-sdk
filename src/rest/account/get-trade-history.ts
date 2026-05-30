import type {
  Paginated,
  TradeCause,
  TradeEventType,
  TradeHistoryEntry,
  TradeHistoryQuery,
  TradeSide,
} from '../../common/native';
import { httpGet } from '../client';

interface TradeHistoryWire {
  history_id: number;
  order_id: number;
  client_order_id: string | null;
  symbol: string;
  amount: string;
  price: string;
  entry_price: string;
  fee: string;
  pnl: string;
  event_type: TradeEventType;
  side: TradeSide;
  cause: TradeCause;
  created_at: number;
}

export function getTradeHistory(
  query: TradeHistoryQuery,
  label?: string,
): Promise<Paginated<TradeHistoryEntry>> {
  return httpGet<TradeHistoryWire[]>(
    '/trades/history',
    {
      account: query.account,
      symbol: query.symbol,
      start_time: query.startTime,
      end_time: query.endTime,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
    items: envelope.data.map((entry) => mapTradeHistoryEntry(entry)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

function mapTradeHistoryEntry(wire: TradeHistoryWire): TradeHistoryEntry {
  return {
    historyId: wire.history_id,
    orderId: wire.order_id,
    clientOrderId: wire.client_order_id,
    symbol: wire.symbol,
    amount: wire.amount,
    price: wire.price,
    entryPrice: wire.entry_price,
    fee: wire.fee,
    pnl: wire.pnl,
    eventType: wire.event_type,
    side: wire.side,
    cause: wire.cause,
    createdAt: wire.created_at,
  };
}
