import type { Order } from '../../common/types';
import { OrderSide } from '../../common/types';

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
      type: TYPE[ot] ?? 'other',
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
