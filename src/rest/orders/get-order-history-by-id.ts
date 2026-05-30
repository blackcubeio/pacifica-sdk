import type {
  OrderHistoryByIdEntry,
  OrderHistoryByIdQuery,
  OrderHistoryEventType,
  OrderSide,
  OrderStatus,
  OrderType,
} from '../../common/native';
import { httpGet } from '../client';

interface OrderHistoryByIdWire {
  history_id: number;
  order_id: number;
  client_order_id: string | null;
  symbol: string;
  side: OrderSide;
  price: string;
  initial_amount: string;
  filled_amount: string;
  cancelled_amount: string;
  event_type: OrderHistoryEventType;
  order_type: OrderType;
  order_status: OrderStatus;
  stop_price: string | null;
  stop_parent_order_id: number | null;
  reduce_only: boolean;
  created_at: number;
}

export function getOrderHistoryById(
  query: OrderHistoryByIdQuery,
  label?: string,
): Promise<OrderHistoryByIdEntry[]> {
  return httpGet<OrderHistoryByIdWire[]>(
    '/orders/history_by_id',
    {
      order_id: query.orderId,
    },
    label,
  ).then((envelope) => envelope.data.map((entry) => mapEntry(entry)));
}

function mapEntry(wire: OrderHistoryByIdWire): OrderHistoryByIdEntry {
  return {
    historyId: wire.history_id,
    orderId: wire.order_id,
    clientOrderId: wire.client_order_id,
    symbol: wire.symbol,
    side: wire.side,
    price: wire.price,
    initialAmount: wire.initial_amount,
    filledAmount: wire.filled_amount,
    cancelledAmount: wire.cancelled_amount,
    eventType: wire.event_type,
    orderType: wire.order_type,
    orderStatus: wire.order_status,
    stopPrice: wire.stop_price,
    stopParentOrderId: wire.stop_parent_order_id,
    reduceOnly: wire.reduce_only,
    createdAt: wire.created_at,
  };
}
