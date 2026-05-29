import type { Side, UserTrade } from '../../common/types';
import { type TradeCause, TradeEventType, TradeSide } from '../types';

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
