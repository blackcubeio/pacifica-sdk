import { httpGet } from '../client';
import type { AccountQuery, Order, OrderSide, OrderType } from '../types';

interface OrderWire {
  order_id: number;
  client_order_id: string | null;
  symbol: string;
  side: OrderSide;
  price: string;
  initial_amount: string;
  filled_amount: string;
  cancelled_amount: string;
  stop_price: string | null;
  order_type: OrderType;
  stop_parent_order_id: number | null;
  reduce_only: boolean;
  created_at: number;
  updated_at: number;
}

export function getOpenOrders(query: AccountQuery, label?: string): Promise<Order[]> {
  return httpGet<OrderWire[]>('/orders', { account: query.account }, label).then((envelope) =>
    envelope.data.map((order) => mapOrder(order)),
  );
}

function mapOrder(wire: OrderWire): Order {
  return {
    orderId: wire.order_id,
    clientOrderId: wire.client_order_id,
    symbol: wire.symbol,
    side: wire.side,
    price: wire.price,
    initialAmount: wire.initial_amount,
    filledAmount: wire.filled_amount,
    cancelledAmount: wire.cancelled_amount,
    stopPrice: wire.stop_price,
    orderType: wire.order_type,
    stopParentOrderId: wire.stop_parent_order_id,
    reduceOnly: wire.reduce_only,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}
