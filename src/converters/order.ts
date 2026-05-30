import { OrderSide, type OrderType } from '../common/native';
import type { Order } from '../common/types';

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

// ── WebSocket (unidirectionnel) ───────────────────────────────────────────────

/**
 * Payload WS `account_order_updates` Pacifica — array d'éléments aux clés courtes
 * `{i, I, u, s, d, p, ip, lp, a, f, oe, os, ot, sp, si, tp, r, ct, ut, li}`.
 * `i`=order id, `I`=client id, `s`=symbol, `d`=side, `ip`=prix limite, `a`=taille,
 * `f`=filled, `os`=statut, `ot`=type, `r`=reduceOnly, `ct`/`ut`=created/updated.
 */
export interface OrderUpdateWsNative {
  i: number;
  I: string | null;
  u: string;
  s: string;
  d: string;
  p: string;
  ip: string;
  lp: string;
  a: string;
  f: string;
  oe: string;
  os: string;
  ot: string;
  sp: string | null;
  si: string | null;
  tp: string | null;
  r: boolean;
  ct: number;
  ut: number;
  li: number;
}

const WS_TYPE: Record<string, Order['type']> = {
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
  canceled: 'canceled',
  rejected: 'rejected',
  expired: 'expired',
};

/**
 * Convertisseur WS **unidirectionnel** ordre → {@link Order}.
 * `price` = `ip` (prix limite), `time` = `ct`. Les natifs `ot`/`os` (et p/lp/oe/sp/si/tp/ut/li/u)
 * vont dans `xtras` — rien jeté.
 */
export class OrderWsConverter {
  toCommon(wire: OrderUpdateWsNative): Order {
    const { i, I, s, d, ip, a, f, ot, os, r, ct, ...rest } = wire;
    return {
      name: s,
      kind: 'perp',
      id: String(i),
      clientId: I,
      side: d === OrderSide.Bid ? 'buy' : 'sell',
      type: WS_TYPE[ot] ?? 'other',
      price: ip,
      size: a,
      filled: f,
      status: STATUS[os] ?? 'other',
      tif: null,
      reduceOnly: r,
      time: ct,
      xtras: { ...rest, ot, os },
    };
  }
}
