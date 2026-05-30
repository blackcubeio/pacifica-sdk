import { type TradeCause, TradeEventType, TradeSide } from '../common/native';
import type { Side, UserTrade } from '../common/types';

/** Fill natif Pacifica (`/trades/history`, clés snake_case). */
export interface UserTradeNative {
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

/** Direction taker (agresseur) déduite du `side` Pacifica (open/close long/short). */
function takerSide(side: TradeSide): Side {
  return side === TradeSide.OpenLong || side === TradeSide.CloseShort ? 'buy' : 'sell';
}

/**
 * Convertisseur **bijectif** fill : `toCommon(native) → UserTrade` / inverse.
 * `side` (open/close→buy/sell) et `maker` (event_type) dérivés ; client_order_id/entry_price/
 * event_type/side/cause natifs conservés dans `xtras`. `feeAsset` non fourni → `null`.
 */
export class UserTradeConverter {
  toCommon(wire: UserTradeNative): UserTrade {
    const { history_id, order_id, symbol, amount, price, fee, pnl, created_at, ...rest } = wire;
    return {
      name: symbol,
      kind: 'perp',
      id: String(history_id),
      orderId: String(order_id),
      side: takerSide(rest.side),
      price,
      size: amount,
      fee,
      feeAsset: null,
      pnl,
      maker: rest.event_type === TradeEventType.FulfillMaker,
      time: created_at,
      xtras: rest as Record<string, unknown>,
    };
  }

  toNative(trade: UserTrade): UserTradeNative {
    return {
      history_id: Number(trade.id),
      order_id: Number(trade.orderId),
      symbol: trade.name,
      amount: trade.size,
      price: trade.price,
      fee: trade.fee,
      pnl: trade.pnl as string,
      created_at: trade.time,
      ...trade.xtras,
    } as unknown as UserTradeNative;
  }
}

// ── WebSocket (unidirectionnel) ───────────────────────────────────────────────

/**
 * Payload WS `account_trades` Pacifica — array d'éléments aux clés courtes
 * `{h, i, I, u, s, p, o, a, te, ts, tc, f, n, t, li, it}`. `h`=fill id, `i`=order id,
 * `te`=event type (fulfill_taker/maker), `ts`=direction (open/close long/short), `n`=pnl.
 */
export interface UserTradeWsNative {
  h: number;
  i: number;
  I: string | null;
  u: string;
  s: string;
  p: string;
  o: string;
  a: string;
  te: string;
  ts: string;
  tc: string;
  f: string;
  n: string;
  t: number;
  li: number;
  it: number;
}

/** Direction taker (agresseur) depuis `ts` (open_long/close_short = achat). */
function wsTakerSide(ts: string): Side {
  return ts === TradeSide.OpenLong || ts === TradeSide.CloseShort ? 'buy' : 'sell';
}

/**
 * Convertisseur WS **unidirectionnel** fill → {@link UserTrade}.
 * `side` (taker depuis `ts`), `maker` (`te`=fulfill_maker), `pnl`=`n`. `feeAsset` non fourni
 * → `null`. Le hors-cœur (I/u/o/ts/tc/li/it + te) va dans `xtras` — rien jeté.
 */
export class UserTradeWsConverter {
  toCommon(wire: UserTradeWsNative): UserTrade {
    const { h, i, s, p, a, f, n, t, te, ...rest } = wire;
    return {
      name: s,
      kind: 'perp',
      id: String(h),
      orderId: String(i),
      side: wsTakerSide(wire.ts),
      price: p,
      size: a,
      fee: f,
      feeAsset: null,
      pnl: n,
      maker: te === TradeEventType.FulfillMaker,
      time: t,
      xtras: { ...rest, te },
    };
  }
}
