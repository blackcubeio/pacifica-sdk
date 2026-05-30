import type { Side, UserTrade } from '../../common/types';
import { TradeEventType, TradeSide } from '../../rest/types';

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
function takerSide(ts: string): Side {
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
      side: takerSide(wire.ts),
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
