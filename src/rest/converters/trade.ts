import type { Side, Trade } from '../../common/types';
import { type TradeCause, TradeEventType, TradeSide } from '../types';

/** Trade public natif Pacifica (`/trades`, par fill). */
export interface TradeNative {
  event_type: TradeEventType;
  price: string;
  amount: string;
  side: TradeSide;
  cause: TradeCause;
  created_at: number;
}

/** Direction taker (agresseur) déduite du `side` Pacifica (open/close long/short). */
function takerSide(side: TradeSide): Side {
  return side === TradeSide.OpenLong || side === TradeSide.CloseShort ? 'buy' : 'sell';
}

/**
 * Convertisseur **bijectif** trade : `toCommon(native) → Trade` / `toNative(trade) → native`.
 * `side` = direction du taker (depuis open/close long/short) ; `maker` = `event_type` vaut
 * `fulfill_maker`. Pacifica n'a pas d'`id` de trade (`null`). `event_type`/`side`/`cause`
 * vont dans `xtras` → bijection totale.
 */
export class TradeConverter {
  toCommon(wire: TradeNative): Trade {
    return {
      price: wire.price,
      size: wire.amount,
      side: takerSide(wire.side),
      maker: wire.event_type === TradeEventType.FulfillMaker,
      time: wire.created_at,
      id: null,
      xtras: { event_type: wire.event_type, side: wire.side, cause: wire.cause },
    };
  }

  toNative(trade: Trade): TradeNative {
    const xtras = trade.xtras ?? {};
    return {
      event_type: xtras.event_type as TradeEventType,
      price: trade.price,
      amount: trade.size,
      side: xtras.side as TradeSide,
      cause: xtras.cause as TradeCause,
      created_at: trade.time,
    };
  }
}
