import type { Order } from '../common/types';
import { type OrderCancelReason, OrderSide, type OrderStatus, type OrderType } from '../rest/types';

/** Ordre d'historique natif Pacifica (`/orders/history`, clés snake_case). */
export interface OrderHistoryNative {
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

const TYPE: Record<string, Order['type']> = {
  limit: 'limit',
  market: 'market',
  stop_limit: 'stop',
  stop_market: 'stopMarket',
  take_profit_limit: 'takeProfit',
  take_profit_market: 'takeProfitMarket',
  stop_loss_limit: 'stop',
  stop_loss_market: 'stopMarket',
};
const STATUS: Record<string, Order['status']> = {
  open: 'open',
  partially_filled: 'partiallyFilled',
  filled: 'filled',
  cancelled: 'canceled',
  rejected: 'rejected',
};

/**
 * Convertisseur **bijectif** ordre d'historique : `toCommon(native) → Order` / inverse.
 * `type`/`status`/`side` dérivés ; natifs (side, order_type, order_status, average_filled_price,
 * stop_price, stop_parent_order_id, reason, updated_at) conservés dans `xtras`.
 */
export class OrderHistoryConverter {
  toCommon(wire: OrderHistoryNative): Order {
    const {
      order_id,
      client_order_id,
      symbol,
      initial_price,
      amount,
      filled_amount,
      reduce_only,
      created_at,
      ...rest
    } = wire;
    return {
      name: symbol,
      kind: 'perp',
      id: String(order_id),
      clientId: client_order_id,
      side: rest.side === OrderSide.Bid ? 'buy' : 'sell',
      type: TYPE[rest.order_type as string] ?? 'other',
      price: initial_price,
      size: amount,
      filled: filled_amount,
      status: STATUS[rest.order_status as string] ?? 'other',
      tif: null,
      reduceOnly: reduce_only,
      time: created_at,
      xtras: rest as Record<string, unknown>,
    };
  }

  toNative(order: Order): OrderHistoryNative {
    return {
      order_id: Number(order.id),
      client_order_id: order.clientId,
      symbol: order.name,
      initial_price: order.price as string,
      amount: order.size,
      filled_amount: order.filled,
      reduce_only: order.reduceOnly as boolean,
      created_at: order.time,
      ...order.xtras,
    } as unknown as OrderHistoryNative;
  }
}
