import { httpGet } from '../client';
import type {
  OrderCancelReason,
  OrderHistoryEntry,
  OrderHistoryQuery,
  OrderSide,
  OrderStatus,
  OrderType,
  Paginated,
} from '../types';

interface OrderHistoryWire {
  order_id: number;
  client_order_id: string | null;
  symbol: string;
  side: OrderSide;
  initial_price: string;
  average_filled_price: string;
  amount: string;
  filled_amount: string;
  order_status: OrderStatus;
  order_type: OrderType;
  stop_price: string | null;
  stop_parent_order_id: number | null;
  reduce_only: boolean;
  reason: OrderCancelReason | null;
  created_at: number;
  updated_at: number;
}

export function getOrderHistory(
  query: OrderHistoryQuery,
  label?: string,
): Promise<Paginated<OrderHistoryEntry>> {
  return httpGet<OrderHistoryWire[]>(
    '/orders/history',
    {
      account: query.account,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
    items: envelope.data.map((entry) => mapOrderHistoryEntry(entry)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

function mapOrderHistoryEntry(wire: OrderHistoryWire): OrderHistoryEntry {
  return {
    orderId: wire.order_id,
    clientOrderId: wire.client_order_id,
    symbol: wire.symbol,
    side: wire.side,
    initialPrice: wire.initial_price,
    averageFilledPrice: wire.average_filled_price,
    amount: wire.amount,
    filledAmount: wire.filled_amount,
    orderStatus: wire.order_status,
    orderType: wire.order_type,
    stopPrice: wire.stop_price,
    stopParentOrderId: wire.stop_parent_order_id,
    reduceOnly: wire.reduce_only,
    reason: wire.reason,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}
