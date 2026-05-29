import type { Order } from '../../common/types';
import { OrderSide, type OrderType } from '../types';

/** Ordre natif Pacifica (`/orders`, clés snake_case). */
export interface OrderNative {
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

/**
 * Convertisseur **bijectif** ordre : `toCommon(native) → Order` / inverse.
 * `side` (bid/ask), `order_type` natif, stop_price, cancelled_amount… conservés dans `xtras`
 * → `toNative` les restitue. `type`/`side` unifiés dérivés. Pacifica `/orders` = ordres ouverts.
 */
export class OrderConverter {
  toCommon(wire: OrderNative): Order {
    const {
      order_id,
      client_order_id,
      symbol,
      price,
      initial_amount,
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
      price,
      size: initial_amount,
      filled: filled_amount,
      status: 'open',
      tif: null,
      reduceOnly: reduce_only,
      time: created_at,
      xtras: rest as Record<string, unknown>,
    };
  }

  toNative(order: Order): OrderNative {
    return {
      order_id: Number(order.id),
      client_order_id: order.clientId,
      symbol: order.name,
      price: order.price as string,
      initial_amount: order.size,
      filled_amount: order.filled,
      reduce_only: order.reduceOnly as boolean,
      created_at: order.time,
      ...order.xtras,
    } as unknown as OrderNative;
  }
}
